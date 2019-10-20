insert into companies( name, email, password, city )
values
	( 'Example', 'example@example.com', '39ca06c357f5fa0606f3d1f7d6714e3032972c7f6d8f11653c5132f8ec327a9a;x40q4', 'Иркутск' ),
	( 'Company', 'company@company.com', '22de3ec1aa2a7e1a853843b3b3e3610ec4d931e40038b7f39c55d06e5de4d718;d2g5p', 'Иркутск' ),
	( 'Связьтранзит', 'st@st.com', 'd2572e9a475e119b343ebcebc0270e46be8aef81fee7ce2d37a555ef759cdd4e;u8t50', 'Иркутск' );
-- @
insert into infoblocks( name, description, companyid, number )
values
	( 'Приветствие', 'Какая-то очень важная и нужная информация по приветствию в замечательной компании Example', 1, 1 ),
	( 'Как не умереть', 'Ну, тут я даже не знаю, что написать, потому что умереть можно при любом обстоятельстве', 1, 2 ),
	( 'Как уволиться из нашей комании', 'Всё просто - пошли кого-нибудь из начальства куда по дальше, громко и с выражением (но без оружия, пожалуйста)', 1, 3 ),
	( 'Как заварить кофе?', 'Я сам не знаю, расскажите мне кто-нибудь', 1, 4 ),
	( 'Company block', 'Дополнительный блок с инфой для второй компании', 2, 1 ),
	( 'Тестовая информация', 'Эта информация является необходимой для прохождения теста за первую неделю обучения сотрудников в компании "Связьтранзит". Очень важно хорошо усвоить эту информацию', 3, 1 );
-- @
insert into workers( name, companyid, key )
values
	( 'Биба', 1, '2465' ),
	( 'Боба', 1, '1930' ),
	( 'Жожа', 1, '8594' ),
	( 'Жопный Зубастик', 1, '1535' ),
	( 'Жожа', 2, '8594' ),
	( 'Вячеслав', 3, '1234' ),
	( 'Максим', 3, '5678' ),
	( 'Кирилл', 3, '9012' ),
	( 'Полина', 3, '3456' ),
	( 'Александр', 3, '2516' );
-- @
insert into blockstoworkers( infoblockid, workerid )
values
	( 1, 1 ), ( 1, 2 ), ( 1, 3 ), ( 1, 4 ),
	( 2, 1 ), ( 2, 2 ), ( 2, 4 ),
	( 3, 1 ), ( 3, 2 ), ( 3, 3 ), ( 3, 4 ),
	( 4, 1 ), ( 4, 2 ), ( 4, 4 ),
	( 5, 5 ),
	( 6, 6 ), ( 6, 7 ), ( 6, 8 ), ( 6, 9 ), ( 6, 10 );