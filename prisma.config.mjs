// prisma.config.mjs (chinaakha-new/prisma.config.mjs - SAME LEVEL as package.json)
import { defineConfig, env } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL')
  }
})