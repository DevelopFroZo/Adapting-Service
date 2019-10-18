let array;

array = [
  [ 0, 0, 0 ],
  [ 0, 0, 1 ],
  [ 0, 1, 0 ],
  [ 1, 0, 0 ],
  [ 0, 1, 1 ],
  [ 1, 0, 0 ],
  [ 1, 1, 0 ],
  [ 1, 1, 1 ]
];

first = [ 0, 1, 0, 1, 1, 1, 1, 1 ];
third = [ 1, 1, 0, 0, 0, 0, 0, 0 ];

for( let i = 0; i < first.length; i++ )
  console.log( first[i] && third[i] );
