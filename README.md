Proyecto backend prueba Grupo Norte 70 realizado con Express js 
El proyecto tiene un token de seguridad dentro de el proyecto server.js 
No inclui archivo en configuracion de variables de entorno (.env) lo realice de manera cruda en la clase principal
La conexion que usa es a PostreSQL con la siguiente cadena de conexión

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Nada1234.',
    database: 'prueba',
    synchronize: true,
    logging: false,
    entities: [TareaEntity],
});
