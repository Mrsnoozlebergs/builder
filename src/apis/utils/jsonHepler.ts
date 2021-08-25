const parse = <T>(str: string, reviver?: (this:any, key: string, value: any) => any) => {
  return JSON.parse(str, reviver) as T;
}

export {
  parse
}