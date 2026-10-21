import { expect, test, type Page } from '@playwright/test';
import type { ListingDetails } from '../src/api/types';

const BUYER = { email: 'customer@smachnogo.local', password: 'Customer12345!' };
const PARTNER = { email: 'partner@smachnogo.local', password: 'Partner12345!' };

async function signIn(page: Page, user: { email: string; password: string }, next: string) {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel('Електронна пошта').fill(user.email);
  await page.getByLabel('Пароль', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: 'Увійти до кабінету' }).click();
  await expect(page).toHaveURL(next, { timeout: 15_000 });
}

test('venue staff hands out a paid order by its code', async ({ browser, baseURL, request }) => {
  const buyerContext = await browser.newContext();
  const buyer = await buyerContext.newPage();
  await signIn(buyer, BUYER, '/');

  await buyer.goto('/search?sort=pickup&pickup=today');
  const firstCard = buyer.locator('article').first();
  await expect(firstCard, 'No sets for today: run npm run db:seed in the API').toBeVisible();
  await firstCard.getByRole('link').first().click();
  await expect(buyer).toHaveURL(/\/listings\/\d+/);

  const listingId = new URL(buyer.url()).pathname.split('/').pop();
  const listingRes = await request.get(`/api/v1/listings/${listingId}`);
  expect(listingRes.ok()).toBe(true);
  const { venue } = (await listingRes.json()) as ListingDetails;

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
  await partnerContext.addInitScript((venueId) => {
    localStorage.setItem(
      'sg-partner',
      JSON.stringify({ state: { venueId, soundEnabled: false }, version: 0 }),
    );
  }, venue.id);

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
