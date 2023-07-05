import { BreadcrumbIF } from '@/interfaces'

/** Returns URL param string with Account ID if present, else empty string. */
function getParams (): string {
  const accountId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id
  return accountId ? `?accountid=${accountId}` : ''
}

export function getRegistryDashboardBreadcrumb (registryHomeUrl: string): BreadcrumbIF {
  return {
    text: 'BC Registries and Online Services',
    href: `${registryHomeUrl}dashboard/${getParams()}`
  }
}

export function getMyBusinessRegistryBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'BC Registries and Online Services',
    href: `${businessUrl}business/${getParams()}`
  }
}

export function getStaffDashboardBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'BC Registries and Online Services',
    href: `${businessUrl}staff/${getParams()}`
  }
}
