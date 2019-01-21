import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import Express from 'express';
import { buildSchema, formatArgumentValidationError } from 'type-graphql';
import { createConnection } from 'typeorm';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

import { RegisterResolver } from './modules/user/Register';
import { LoginResolver } from './modules/user/Login';
import { redis } from './redis';

const main = async () => {
	await createConnection();

	const schema = await buildSchema({
		resolvers: [RegisterResolver, LoginResolver],
	});

	const apolloServer = new ApolloServer({
		schema,
		formatError: formatArgumentValidationError,
		context: ({ req }: any) => ({ req }),
	});

	const app = Express();

	const RedisStore = connectRedis(session);

	app.use(
		cors({
			credentials: true,
			origin: 'http://localhost:4000',
		})
	);

	app.use(
		session({
			store: new RedisStore({
				client: redis as any,
			}),
			name: 'qid',
			secret: 'SESSION_SECRET',
			resave: false,
			saveUninitialized: false,
			cookie: {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
			},
		})
	);

	apolloServer.applyMiddleware({ app });

	app.listen(4000, () => {
		console.log('server started on http://localhost:4000/graphql');
	});
};

main();
