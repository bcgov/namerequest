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

export function getStaffDashboardBreadcrumb (businessUrl: string): BreadcrumbIF {
  return {
    text: 'Staff Dashboard',
    href: `${businessUrl}staff/${getParams()}`
  }
}
