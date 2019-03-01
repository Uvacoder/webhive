import * as Koa from 'koa';
import * as Router from 'koa-tree-router';
import * as koaBodyparser from 'koa-bodyparser';
import { config } from './config';

const app = new Koa();
const router = new Router();

const appContext = {
    app,
    router,
};

export type AppContext = typeof appContext;

async function main() {
    await import('./app/home/home.module').then(module => module.homeModule({ app, router }));
    app.use(koaBodyparser({ strict: false }));
    app.use(router.routes());
    app.listen(config.get('port'), () => {
        console.log(`Server running on port ${config.get('port')}`);
    });
}

main();
