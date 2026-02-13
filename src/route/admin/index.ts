import { Hono } from 'hono';
import blog from './blog/index.ts';
import media from './media/index.ts';
import stats from './stats/index.ts';
import portfolio from './portfolio/index.ts';
import workType from './work-type/index.ts';

const app = new Hono();

app.route('/blog', blog);
app.route('/media', media);
app.route('/stats', stats);
app.route('/portfolio', portfolio);
app.route('/work-type', workType);

export default app;
