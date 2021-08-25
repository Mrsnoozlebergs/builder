import { EditorRendererBaseConfig, EditorRendererConfig, RendererBasicConfig, RendererConfig } from "src/interface/fatory";

const renderers: Array<RendererConfig> = [];
const rendererNames: Array<string> = [];
const editorRenderers: Map<string, EditorRendererConfig> = new Map();

const EditorRenderer = <T, R = T>(config: EditorRendererBaseConfig<T, R>) =>
  (component: any) => {
    if (!editorRenderers.has(config.name)) {
      console.log('render register editor', config.name);
      editorRenderers.set(config.name, {
        ...config,
        component
      });
    }

    return component;
  }

const getEditorComponent = (component: string): EditorRendererConfig | null => {
  let res: EditorRendererConfig | null = null;
  editorRenderers.forEach((v: EditorRendererConfig) => {
    if (v.test.test(component)) {
      res = v;
    }
  })

  return res;
}

const getEditorHelper = (component: string): EditorRendererConfig['helper'] | null => {
  let res: EditorRendererConfig['helper'] | null = null;
  editorRenderers.forEach((v: EditorRendererConfig) => {
    if (v.test.test(component)) {
      res = v.helper;
    }
  })

  return res;
}

const Renderer = <Data>(config: RendererBasicConfig<Data>) =>
  <T extends React.ComponentType>(component: T) => {
    console.log('render register component', config.name);
    const renderer = registerRenderer({
      ...config,
      component
    })
    return renderer.component as T;
  }

const registerRenderer = (config: RendererConfig): RendererConfig => {
  if (!config.test) {
    throw new TypeError('config.test is required');
  } else if (!config.component) {
    throw new TypeError('config.component is required');
  }

  const idx = findIndex(
    renderers,
    item => (config.weight as number) < item.weight
  );
  ~idx ? renderers.splice(idx, 0, config) : renderers.push(config);
  rendererNames.push(config.name!);

  return config;
}

export function unRegisterRenderer(config: RendererConfig | string) {
  let idx =
    typeof config === 'string'
      ? findIndex(renderers, item => item.name === config)
      : renderers.indexOf(config);
  ~idx && renderers.splice(idx, 1);

  let idx2 =
    typeof config === 'string'
      ? findIndex(rendererNames, item => item === config)
      : rendererNames.indexOf(config.name || '');
  ~idx2 && rendererNames.splice(idx2, 1);
}

function getComponent(component: string) {
  const idx = findIndex(renderers, item => item.name === component || item?.test.test(component));

  return renderers[idx];
}

function checkComponentExits(component: string): boolean {
  return renderers.some(_ => _.name === component || _.test.test(component));
}

function findIndex(
  arr: Array<any>,
  detect: (item?: any, index?: number) => boolean
) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (detect(arr[i], i)) {
      return i;
    }
  }

  return -1;
}

const getRenderer = () => renderers;

export {
  Renderer,
  getRenderer,
  registerRenderer,
  getComponent,
  getEditorComponent as getEditorConponent,
  EditorRenderer,
  getEditorHelper,
  checkComponentExits
}