"use client";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { Alert, Button, ConfigProvider, Dropdown, Menu, MenuProps, message } from "antd";
import {
  BranchesOutlined,
  ContainerOutlined,
  GroupOutlined,
  HomeOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingOutlined,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { User } from "@prisma/client";
import { UserLoginAndLogoutActions } from "../login/actions";
import dayjs from "dayjs";
import {
  ItemType,
  MenuItemType as AntdMenuItemType,
  SubMenuType,
} from "antd/es/menu/hooks/useItems";
import { isNil } from "lodash";

export type AdminContextType = {
  appName: string;
  appLogo: string;
  user: User | null;
  settings: {
    appName: string;
    appLogo: string;
  };
};
export const ManageContext = createContext({} as AdminContextType)

const pathPrefix = "/manage";
let items: ItemType[] = [
  { label: "首页", key: "home", icon: <HomeOutlined />, path: "home" },
];

let versionChecker = null as any
let newVersion = null as any
let newVersionDate = null as any

export function AdminRootLayout(p: {
  children: React.ReactNode
  user: User | null,
  settings: {
    appName: string
    appLogo: string
  }
  appName: string
  appLogo: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [keys, setKeys] = useState<string[]>([])
  const [initailized, setInitailized] = useState(false)
  const [displayUpdateInfo, setDisplayUpdateInfo] = useState(false)

  const [routeList, setRouteList] = useState(items)


  useEffect(() => {
    if (versionChecker) {
      clearInterval(versionChecker)
    }
    // 已有新版本则不再检查
    if (displayUpdateInfo) {
      return
    }
    versionChecker = setInterval(() => {
      try {
        fetch('/api/health/version')
          .then((r) => r.json())
          .then((data) => {
            newVersion = data.version
            newVersionDate = new Date(data.versionDate)
            let now = new Date()
            // 大于1分钟的版本，才提示更新（避免后台滚动更新导致的多次刷新）
            if (
              newVersion != process.env.NEXT_PUBLIC_VERSION &&
              now.getTime() - newVersionDate.getTime() > 1000 * 60
            ) {
              setDisplayUpdateInfo(true)
              clearInterval(versionChecker)
            }
          })
      } catch (e) {
        console.error(e)
      }
    }, 1000 * 30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const newRouteList = [...routeList];
    if (!routeList?.find((x: any) => x?.title == "系统")) {
      newRouteList.push({
        label: "系统",
        title: "系统",
        key: "system",
        path: "system",
        icon: <SettingOutlined />,
      });
    }

    if (newRouteList.length !== routeList.length) setRouteList(newRouteList);
  }, [p.settings, routeList]);

  useEffect(() => {
    if (!initailized) {
      setInitailized(true)
    }
  }, [initailized])

  const generateKeyToPathAndPathToKey = (
    routes: MenuItemType[] = [],
    prefixKey = "",
    prefixPath = "",
  ) => {
    let keyToPathMap: Record<string, string> = {};
    let pathToKeyMap: Record<string, string> = {};
    if (!routes.length) {
      return {
        keyToPathMap,
        pathToKeyMap,
      };
    }

    for (const route of routes) {
      const { key: curKey, rewritepath, path } = route;
      const fullKey = [prefixKey, curKey].filter(Boolean).join(",");
      if (rewritepath) {
        const {
          keyToPathMap: childKeyToPathMap,
          pathToKeyMap: childPathToKeyMap,
        } = generateKeyToPathAndPathToKey(
          route?.children ?? [],
          fullKey,
          rewritepath,
        );
        keyToPathMap = {
          [fullKey]: rewritepath,
          ...keyToPathMap,
          ...childKeyToPathMap,
        };
        pathToKeyMap = {
          [rewritepath]: fullKey,
          ...pathToKeyMap,
          ...childPathToKeyMap,
        };
        continue;
      }

      if (!isNil(path)) {
        const fullPath = [prefixPath, path].filter(Boolean).join("/");
        const {
          keyToPathMap: childKeyToPathMap,
          pathToKeyMap: childPathToKeyMap,
        } = generateKeyToPathAndPathToKey(
          route?.children ?? [],
          fullKey,
          fullPath,
        );
        keyToPathMap = {
          [fullKey]: fullPath,
          ...keyToPathMap,
          ...childKeyToPathMap,
        };
        pathToKeyMap = {
          [fullPath]: fullKey,
          ...pathToKeyMap,
          ...childPathToKeyMap,
        };
      }
    }
    return { keyToPathMap, pathToKeyMap };
  };

  const key2PathAndPath2Key = useMemo(() => {
    const { keyToPathMap, pathToKeyMap } =
      generateKeyToPathAndPathToKey(routeList);
    return {
      keyToPathMap,
      pathToKeyMap,
    };
  }, [routeList]);

  useEffect(() => {
    let path = pathname.replace(pathPrefix, "");
    switch (path) {
      case "":
        setKeys(["home"]);
        return;
      default:
        const { pathToKeyMap } = key2PathAndPath2Key;
        const maxMatch = Object.entries(pathToKeyMap).reduce(
          (preVal, [key, val]) => {
            if (path.startsWith(`/${key}`)) {
              const curValLen = val.length;
              const preValLen = preVal.length;
              return curValLen > preValLen ? val : preVal;
            }
            return preVal;
          },
          "",
        )
        setKeys(maxMatch.split(','))
    }
  }, [key2PathAndPath2Key, pathname]);

  if (!initailized) {
    return null
  }

  if (pathname == '/manage/login') {
    return (
      <ManageContext.Provider
        value={{
          appName: p.appName,
          appLogo: p.appLogo,
          user: p.user,
          settings: p.settings,
        }}>
        {p.children}
      </ManageContext.Provider>
    )
  }

  if (!p.user) {
    router.push('/manage/login')
    return null
  }

  const onKeysSelect: MenuProps["onSelect"] = ({ keyPath }) => {
    const newKeys = [...keyPath].reverse()
    const stringKey = newKeys.join(',')
    const newPath = `${pathPrefix}/${key2PathAndPath2Key.keyToPathMap[stringKey]}`
    router.push(newPath)
  };

  // const isIframe = window.self !== window.top
  // 通过识别专用路径 /manage/iframe
  const isIframe = pathname.startsWith('/manage/iframe') || location.href.includes('isIframe=true')

  return (
    <ConfigProvider locale={zhCN}>
      {!isIframe && displayUpdateInfo && (
        <div className=" fixed w-1/2 top-2 left-1/4 z-50">
          <Alert
            showIcon
            message={`发现新版本 ${newVersion}（${dayjs(newVersionDate).format(
              'YYYY-MM-DD HH:mm:ss'
            )}），请刷新加载新版本。`}
            action={
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  window.location.reload()
                }}>
                立即刷新
              </Button>
            }
            closable
          />
        </div>
      )}

      <main

        style={
          !isIframe ?
            {
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              height: '100vh',
              width: '100vw',
            }
            :
            {
              //
            }
        }

      >

        {
          !isIframe &&
          <div
            style={{
              width: 160,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #e8e8e8',
              flexShrink: 0,
            }}>
            <div
              style={{
                padding: '16px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #e8e8e8',
              }}>
              <img src={p.appLogo} alt="logo" height="32" />
              <span
                style={{
                  marginTop: 8,
                  fontSize: 16,
                }}>
                {p.appName}
              </span>
            </div>

            <Menu
              mode="inline"
              selectedKeys={keys}
              onSelect={onKeysSelect}
              defaultOpenKeys={keys.length > 1 ? [keys[0]] : []}
              style={{ height: '100%', borderRight: 0 }}
              items={routeList}
            />

            <div className=" text-center py-2">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: '1',
                      label: '退出登录',
                      onClick: () => {
                        UserLoginAndLogoutActions.logout()
                      },
                    },
                  ],
                }}
                placement="top"
                arrow
                trigger={['click']}>
                <Button type="text">
                  <UserOutlined /> {p.user?.username}
                </Button>
              </Dropdown>
            </div>

            <div className="text-center pb-2 text-xs text-gray-300">
              版本：{process.env.NEXT_PUBLIC_VERSION}
            </div>
          </div>
        }

        <div className=" overflow-auto">
          <ManageContext.Provider
            value={{
              appName: p.appName,
              appLogo: p.appLogo,
              user: p.user,
              settings: p.settings,
            }}>
            {p.children}
          </ManageContext.Provider>
        </div>

      </main>
    </ConfigProvider>
  )
}
