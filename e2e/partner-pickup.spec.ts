import { expect, test, type Page } from '@playwright/test';
import type { PartnerVenue } from '../src/api/types';

const BUYER = { email: 'customer@smachnogo.local', password: 'Customer12345!' };
const PARTNER = { email: 'partner@smachnogo.local', password: 'Partner12345!' };

async function signIn(page: Page, user: { email: string; password: string }, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Електронна пошта').fill(user.email);
  await page.getByLabel('Пароль').fill(user.password);
  await page.getByRole('button', { name: 'Увійти' }).click();
  await expect(page).toHaveURL(next);
}

test('venue staff hands out a paid order by its code', async ({ browser, baseURL }) => {
  const buyerContext = await browser.newContext();
  const buyer = await buyerContext.newPage();
  await signIn(buyer, BUYER, '/');

  await buyer.goto('/search?sort=pickup');
  const firstCard = buyer.locator('article').first();
  await expect(firstCard).toBeVisible();
  await firstCard.getByRole('link').first().click();
  await expect(buyer).toHaveURL(/\/listings\/\d+/);

  const venueHref = await buyer.locator('a[href^="/venues/"]').first().getAttribute('href');
  const venueSlug = venueHref?.split('/').pop();
  expect(venueSlug).toBeTruthy();

  await buyer.getByRole('button', { name: /^Забронювати за/ }).click();
  await expect(buyer).toHaveURL(/\/checkout\//);
  const testPay = buyer.getByRole('button', { name: 'Оплатити (тест)' });
  const realPay = buyer.getByRole('button', { name: /^Оплатити \d/ });
  await expect(testPay.or(realPay)).toBeVisible();
  test.skip(
    await realPay.isVisible(),
    'The API runs with the LiqPay provider; the e2e flow needs PAYMENT_PROVIDER=fake.',
  );
  await testPay.click();
  await expect(buyer).toHaveURL(/\/orders\/[\w-]+\/success$/);
  const code = (await buyer.getByLabel('Код замовлення').textContent())?.trim() ?? '';
  expect(code).toMatch(/^[A-Z0-9]{6}$/);
  await buyerContext.close();

  const partnerContext = await browser.newContext({ baseURL });
  const login = await partnerContext.request.post('/api/v1/auth/login', { data: PARTNER });
  expect(login.ok()).toBe(true);
  const { accessToken } = (await login.json()) as { accessToken: string };
  const venuesRes = await partnerContext.request.get('/api/v1/partner/venues', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const venue = ((await venuesRes.json()) as PartnerVenue[]).find((v) => v.slug === venueSlug);
  expect(venue, `partner does not manage ${venueSlug}`).toBeTruthy();
  await partnerContext.addInitScript((venueId) => {
    localStorage.setItem(
      'sg-partner',
      JSON.stringify({ state: { venueId, soundEnabled: false }, version: 0 }),
    );
  }, venue!.id);

  const partner = await partnerContext.newPage();
  await signIn(partner, PARTNER, '/partner/pickup');
  await expect(partner.getByRole('heading', { name: 'Видача замовлення' })).toBeVisible();

  await partner.getByLabel('Код замовлення').fill(code);
  await partner.getByRole('button', { name: 'Перевірити' }).click();
  await expect(partner.getByRole('heading', { name: 'Замовлення знайдено' })).toBeVisible();
  await partner.getByRole('button', { name: 'Видати' }).click();
  await expect(partner.getByText('Замовлення видано. Смачного!')).toBeVisible();

  await partner.goto('/partner/orders');
  await expect(partner.getByText(code)).toBeVisible();
  await partnerContext.close();
});
