import { expect, test, type APIRequestContext } from '@playwright/test';

const MAILHOG_URL = process.env.E2E_MAILHOG_URL ?? 'http://localhost:8025';

interface MailhogMessage {
  Content: { Body: string; Headers: Record<string, string[]> };
}

async function verificationLink(request: APIRequestContext, email: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const res = await request.get(`${MAILHOG_URL}/api/v2/search`, {
      params: { kind: 'to', query: email },
    });
    const body = (await res.json()) as { items: MailhogMessage[] };
    for (const message of body.items) {
      const encoding = message.Content.Headers['Content-Transfer-Encoding']?.[0]?.toLowerCase();
      const body = message.Content.Body;
      const text =
        encoding === 'base64'
          ? Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8')
          : body.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
      const match = text.match(/https?:\/\/[^\s"<>]+\/verify-email\?token=[\w%-]+/);
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No verification email for ${email}`);
}

test('buyer registers, verifies email, books a set and gets a QR voucher', async ({
  page,
  request,
}, testInfo) => {
  const email = `e2e-${testInfo.project.name}-${Date.now()}@smachnogo.local`;

  await page.goto('/register');
  await page.getByLabel('Імʼя').fill('Тест');
  await page.getByLabel('Електронна пошта').fill(email);
  await page.getByLabel('Пароль', { exact: true }).fill('Test12345!');
  await page.getByLabel('Підтвердження').fill('Test12345!');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Зареєструватися', exact: true }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });

  const link = new URL(await verificationLink(request, email));
  await page.goto(`${link.pathname}${link.search}`);
  await expect(page.getByRole('alert').filter({ hasText: 'Email підтверджено' })).toBeVisible();

  await page.goto('/location');
  await page.getByRole('button', { name: 'Київ' }).click();
  await page.getByRole('button', { name: 'Показати набори' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/search?sort=pickup');
  const firstCard = page.locator('article').first();
  await expect(firstCard).toBeVisible();
  await firstCard.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/listings\/\d+(\?|$)/);

  await page.getByRole('button', { name: /^Забронювати за/ }).click();
  await expect(page).toHaveURL(/\/checkout\//);

  const testPay = page.getByRole('button', { name: 'Оплатити (тест)' });
  const realPay = page.getByRole('button', { name: /^Оплатити \d/ });
  await expect(testPay.or(realPay)).toBeVisible();
  test.skip(
    await realPay.isVisible(),
    'The API runs with the LiqPay provider; the e2e flow needs PAYMENT_PROVIDER=fake.',
  );
  await testPay.click();

  await expect(page).toHaveURL(/\/orders\/[\w-]+\/success$/);
  await expect(page.getByRole('heading', { name: 'Замовлення підтверджено!' })).toBeVisible();
  await expect(page.getByLabel('Код замовлення')).toHaveText(/^[A-Z0-9]{6}$/);
});
