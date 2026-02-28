export const Meta = {
    page: {
        index: 'IndexDashboard',
    },
    name: 'Dashboard',
    title: 'Dashboard',
    icon: 'stop_circle',
    module: 'dashboard',
    permission: {
        browse: true,
        read: true,
        create: true,
        update: true,
        delete: true,
        restore: true,
    },
}

export const unreactive = <T>(arr: T): T => {
    try {
      return JSON.parse(JSON.stringify(arr))
    } catch {
      console.warn('Helper unreactive parsing error')
      return arr
    }
  }