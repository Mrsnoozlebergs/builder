const navigateTo = (path: string) => {
  // eslint-disable-next-line
  location.hash = `#/${path}`
}

export {
  navigateTo
}