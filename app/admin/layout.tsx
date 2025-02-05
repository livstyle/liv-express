// 生成一個nextjs layout，用於管理後台頁面的layout (包含header, footer, sidebar)
// 其中菜單是從服務端讀取的
// 注意：此为服务器端组件
require('dotenv').config()
import { getUserByToken, user_jwt_cookie_key } from '@/tools/server/userLogin'
import { AdminRootLayout } from './(this)/RootLayout'
import { cookies } from 'next/headers'
import { User } from '@prisma/client'
import { clientConfig } from '../common/client/routes'
import { SystemSettingService } from './system/setting/service'
import { pick } from 'lodash'

export const dynamic = 'force-dynamic'

export default async function Layout(p: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const jwt_token = cookieStore.get(user_jwt_cookie_key)?.value

  // 加载供应链配置（注意，不能全部给前端）
  let settings = await SystemSettingService.getSettings()

  // 加载用户信息
  let user = null as User | null
  if (jwt_token) {
    user = await getUserByToken(jwt_token).then((r) => r?.user || null)
  }

  return (
    <AdminRootLayout
      user={user}
      settings={pick(settings,
        // 注意，不能全部给前端，正向挑选
        [
          'appName', 
          'appLogo', 
        ]
      )}
      appName=''
      appLogo=''
    >
      {p.children}
    </AdminRootLayout>
  )
}
