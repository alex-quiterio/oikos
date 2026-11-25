import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { AtlasService } from '@application';
import { StaticCatalogue } from '@infrastructure';
import { App, configureAtlas } from '@presentation';
import '@presentation/styles/global.css';

// Composition root: the only place where the layers are wired together.
configureAtlas(new AtlasService(new StaticCatalogue()));
createApp(App).use(createPinia()).mount('#app');
