-- blockstoworkers
CREATE TABLE public.blockstoworkers
(
    infoblockid integer NOT NULL,
    workerid integer NOT NULL,
    ispassed boolean NOT NULL DEFAULT false,
    isseen boolean NOT NULL DEFAULT false
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.blockstoworkers
    OWNER to adaptingservice;

-- companies
CREATE TABLE public.companies
(
    id integer NOT NULL DEFAULT nextval('companies_id_seq'::regclass),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    token character varying(2048) COLLATE pg_catalog."default",
    CONSTRAINT companies_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.companies
    OWNER to adaptingservice;

-- infoblocks
CREATE TABLE public.infoblocks
(
    id integer NOT NULL DEFAULT nextval('infoblocks_id_seq'::regclass),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    companyid integer NOT NULL,
    "number" integer NOT NULL,
    CONSTRAINT blockswithinformation_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.infoblocks
    OWNER to adaptingservice;

-- possibleanswers
CREATE TABLE public.possibleanswers
(
    id integer NOT NULL DEFAULT nextval('possibleanswers_id_seq'::regclass),
    questionid integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    isright boolean NOT NULL,
    CONSTRAINT possibleanswers_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.possibleanswers
    OWNER to adaptingservice;

-- questions
CREATE TABLE public.questions
(
    id integer NOT NULL DEFAULT nextval('questions_id_seq'::regclass),
    testid integer NOT NULL,
    type integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    "time" integer NOT NULL,
    CONSTRAINT questions_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.questions
    OWNER to adaptingservice;

-- tests
CREATE TABLE public.tests
(
    id integer NOT NULL DEFAULT nextval('tests_id_seq'::regclass),
    infoblockid integer NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT tests_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tests
    OWNER to adaptingservice;

-- workeranswers
CREATE TABLE public.workeranswers
(
    workerid integer NOT NULL,
    questionid integer NOT NULL,
    answerid integer NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.workeranswers
    OWNER to adaptingservice;

-- workers
CREATE TABLE public.workers
(
    id integer NOT NULL DEFAULT nextval('workers_id_seq'::regclass),
    name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    key character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    telegramid integer,
    companyid integer NOT NULL,
    CONSTRAINT workers_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.workers
    OWNER to adaptingservice;
