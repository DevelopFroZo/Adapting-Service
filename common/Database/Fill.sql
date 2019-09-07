insert into companies( name, email, password )
values( 'Example', 'example@example.com', '04b4193983af28cd2e6f875707fd85f3dc76cd8d;x40q4' );

insert into infoblocks( name, description, companyid )
values
		( 'Приветствие', 'Какая-то очень важная и нужная информация по приветствию в замечательной компании Example', 1 ),
		( 'Как не умереть', 'Ну, тут я даже не знаю, что написать, потому что умереть можно при любом обстоятельстве', 1 ),
		( 'Как уволиться из нашей комании', 'Всё просто - пошли кого-нибудь из начальства куда по дальше, громко и с выражением (но без оружия, пожалуйста)', 1 ),
		( 'Как заварить кофе?', 'Я сам не знаю, расскажите мне кто-нибудь', 1 );

insert into workers( name, key )
values
		( 'Биба', '63935f1f0897c4546855f58b6c9a2ed92f41b296;5g23g' ),
		( 'Боба', '7666f5358bc4163d23dae4720f33aec62a6e64f2;jgj56' ),
		( 'Жожа', '1b95da9a1992ddb9fdba29beeaf5bea9fc46d52c;j9g5j' ),
		( 'Жопный Зубастик', 'fa63a076b768a1c8e033e7e227fd14e294003d39;df0hj' );

insert into blockstoworkers( infoblockid, workerid )
values( 1, 1 ), ( 1, 2 ), ( 1, 3 ), ( 1, 4 );
