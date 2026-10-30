import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),data:text('data').notNull()});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),data:text('data').notNull()});
export const customers=sqliteTable('customers',{phone:text('phone').primaryKey(),name:text('name').notNull(),created:text('created').notNull()});
export const orders=sqliteTable('orders',{id:text('id').primaryKey(),requestKey:text('request_key').notNull().unique(),token:text('token').notNull(),phone:text('phone').notNull(),name:text('name').notNull(),created:text('created').notNull(),status:text('status').notNull(),paid:integer('paid').notNull().default(0),subtotal:integer('subtotal').notNull(),fee:integer('fee'),data:text('data').notNull()});
export const expenses=sqliteTable('expenses',{id:text('id').primaryKey(),date:text('date').notNull(),description:text('description').notNull(),amount:integer('amount').notNull()});
