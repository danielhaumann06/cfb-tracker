import { expect, test, type Page } from '@playwright/test'

// Load a page and fail on a server error, a client-side crash, or an
// uncaught exception in the browser.
async function expectHealthy(page: Page, path: string) {
  const errors: Error[] = []
  page.on('pageerror', (err) => errors.push(err))

  const response = await page.goto(path)
  expect(response?.status(), `${path} status`).toBeLessThan(400)
  await expect(page.locator('body')).not.toContainText(
    /Application error|Internal Server Error|This page could not be found/
  )
  expect(errors, `${path} uncaught errors`).toEqual([])
}

const staticRoutes = [
  '/',
  '/scores',
  '/polls',
  '/conferences',
  '/rankings/national',
  '/team/nebraska-cornhuskers',
  '/team/oregon-ducks',
  '/team/alabama-crimson-tide',
  '/team/georgia-tech-yellow-jackets',
  '/team/colorado-buffaloes',
]

for (const route of staticRoutes) {
  test(`loads ${route}`, async ({ page }) => {
    await expectHealthy(page, route)
  })
}

// Game and conference pages need IDs from live data, so follow a link
// from the listing page instead of hard-coding one that goes stale.
test('opens a conference page', async ({ page }) => {
  await page.goto('/conferences')
  const href = await page.locator('a[href^="/conferences/"]').first().getAttribute('href')
  expect(href).toBeTruthy()
  await expectHealthy(page, href!)
})

test('opens a game page', async ({ page }) => {
  await page.goto('/scores')
  const href = await page.locator('a[href^="/scores/"]').first().getAttribute('href')
  test.skip(!href, 'no games listed this week')
  await expectHealthy(page, href!)
})

test('health of the scores API', async ({ request }) => {
  const res = await request.get('/api/scores')
  expect(res.ok()).toBe(true)
})
