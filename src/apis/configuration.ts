import { Configuration } from '@midwayjs/decorator';
import * as orm from '@midwayjs/orm';

@Configuration({
  importConfigs: ['./config/'],
  imports: [
    '@midwayjs/faas-middleware-static-file',
    orm
  ],
})
export class ContainerConfiguration { }
