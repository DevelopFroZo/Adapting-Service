delete from blockstoworkers;

delete from companies;
alter sequence companies_id_seq restart;

delete from infoblocks;
alter sequence infoblocks_id_seq restart;

delete from possibleanswers;
alter sequence possibleanswers_id_seq restart;

delete from questions;
alter sequence questions_id_seq restart;

delete from workersanswers;

delete from workers;
alter sequence workers_id_seq restart;
