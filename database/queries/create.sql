CREATE TABLE public.blockstoworkers
(
    infoblockid integer NOT NULL,
    workerid integer NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.blockstoworkers
    OWNER to adaptingservice;

-- @
CREATE TABLE public.codes
(
    code character varying(6) COLLATE pg_catalog."default" NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.codes
    OWNER to adaptingservice;

-- @
CREATE TABLE public.companies
(
    id serial NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    token character varying(2048) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default" NOT NULL,
    login character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT companies_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.companies
    OWNER to adaptingservice;

-- @
CREATE TABLE public.infoblocks
(
    id serial NOT NULL,
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
-- @
ALTER TABLE public.infoblocks
    OWNER to adaptingservice;

-- @
CREATE TABLE public.lastcodestate
(
    state character varying(17) COLLATE pg_catalog."default" NOT NULL
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.lastcodestate
    OWNER to adaptingservice;

-- @
CREATE TABLE public.possibleanswers
(
    id serial NOT NULL,
    questionid integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    isright boolean NOT NULL,
    "number" integer NOT NULL,
    CONSTRAINT possibleanswers_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.possibleanswers
    OWNER to adaptingservice;

-- @
CREATE TABLE public.questions
(
    id serial NOT NULL,
    infoblockid integer NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    "time" integer NOT NULL,
    type character varying(10) COLLATE pg_catalog."default" NOT NULL,
    "number" integer NOT NULL,
    CONSTRAINT questions_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.questions
    OWNER to adaptingservice;

-- @
CREATE TABLE public.workers
(
    id serial NOT NULL,
    name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    key character varying(2048) COLLATE pg_catalog."default" NOT NULL,
    companyid integer NOT NULL,
    CONSTRAINT workers_pkey PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.workers
    OWNER to adaptingservice;

-- @
CREATE TABLE public.workersanswers
(
    workerid integer NOT NULL,
    questionid integer NOT NULL,
    answer character varying(200) COLLATE pg_catalog."default" NOT NULL,
    isright boolean
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.workersanswers
    OWNER to adaptingservice;

-- @
CREATE TABLE public.workersstates
(
    workerid integer NOT NULL,
    telegramid integer NOT NULL,
    isusing boolean NOT NULL DEFAULT true,
    status integer NOT NULL DEFAULT 0,
    infoblocknumber integer NOT NULL DEFAULT 0,
    infoblockid integer,
    questionnumber integer NOT NULL DEFAULT 0,
    questionid integer,
    answertype character varying(200) COLLATE pg_catalog."default",
    "time" integer
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;
-- @
ALTER TABLE public.workersstates
    OWNER to adaptingservice;
