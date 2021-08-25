export interface IRoutes {
    path: string;
    component: string;
    authority?: Array<string>;
    routes?: IRoutes[];
    strict?: boolean;
    exact?: boolean;
}
