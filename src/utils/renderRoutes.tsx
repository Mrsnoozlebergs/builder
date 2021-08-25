import React from "react";
import { Route, Switch, Redirect } from 'react-router-dom';
import ErrorComponent404 from '../render/pages/error/404';
import { IRoutes } from "../interface";

const renderRoutes = async (routes: IRoutes[], extraProps: any = {}, switchProps: any = {}, route?: string) =>
  routes ?
    (
      <Switch {...switchProps}>
        {
          !route ?
            (
              <Route exact path="/">
                <Redirect to="/index" />
              </Route>
            ) : null
        }
        {
          await Promise.all(routes.map(async (r, i) => {
            const Cp = await import(`../render/pages/${r.component}`);
            return (
              <Route
                key={r.path || i}
                path={route ? route + r.path : r.path}
                exact={r.exact || true}
                strict={r.strict || true}
                render={(props) => (
                  <Cp.default {...props} />
                )}
              >
                {
                  await (r.routes && r.routes.length > 0 ?
                    renderRoutes(r.routes, {}, {}, r.path) :
                    null)
                }
              </Route>
            )
          }))
        }
        {
          !route ?
            (
              <Route path="*">
                <ErrorComponent404 />
              </Route>
            ) : null
        }

      </Switch>
    ) : null;


export default renderRoutes;