import * as loadScript from '@shinin/load-script';
import * as createRouter from 'space-router';
import './style.css';
import { App } from './app/app.component';
import { NotFound } from './app/notfound/notfound.component';
import { isNavigatePushCustomEvent, isNavigateSetCustomEvent } from './app/events';
import * as on from 'space-router/src/on';
import { createElement as h } from 'h-document-element';

async function main() {
    const config = await import(/* webpackIgnore: true */ './app.component.config.js');
    const loadingComponents = Object.values(config.components as any[])
        .filter(c => c.enabled)
        .map(c => loadScript(c.main) as Promise<any>);
    let router;
    const routes = [
        ['', App, [
            ['*', NotFound],
        ]],
    ];
    await Promise.all(loadingComponents);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApplication, { once: true });
    } else {
        startApplication();
    }

    const subsriptions = [
        on(window, 'route.navigate.push', handleEvents),
        on(window, 'route.navigate.set', handleEvents),
    ];

    function startApplication() {
        dispatchEvent(new CustomEvent('application.start', { detail: { routes } }));
        router = createRouter(routes, { mode: 'hash' });
        router.start(transition);
    }

    function handleEvents(event: Event) {
        if (isNavigatePushCustomEvent(event)) {
            router.push(event.detail.url, event.detail.options);
        } else if (isNavigateSetCustomEvent(event)) {
            router.set(event.detail);
        }
    }

    function transition(route, components) {
        dispatchEvent(new CustomEvent('route.transition.start', { detail: { route, components } }));
        const app = components.reduceRight((children, Component) => {
            return Component({ params: route.params, query: route.query, children });
        }, null);
        dispatchEvent(new CustomEvent('route.transition.end', { detail: { route, components, app } }));
        document.body.firstChild!.replaceWith(app);
    }

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => {
            router.stop();
            subsriptions.forEach(unsubscribe => unsubscribe());
        });
    }

}

main();
