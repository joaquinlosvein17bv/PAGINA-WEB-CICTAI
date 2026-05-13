import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { OticCode } from './otic-codes/entities/otic-code.entity';
import { EjeTematico } from './ejes-tematicos/entities/eje-tematico.entity';
import { Ponencia } from './ponencias/entities/ponencia.entity';
import { User } from './users/entities/user.entity';

config();

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [OticCode, EjeTematico, User, Ponencia],
    synchronize: true,
  });

  await ds.initialize();
  console.log('Conectado a la base de datos');

  const oticRepo = ds.getRepository(OticCode);
  const ejeRepo = ds.getRepository(EjeTematico);
  const userRepo = ds.getRepository(User);
  const ponenciaRepo = ds.getRepository(Ponencia);

  // ── Códigos OTIC ──
  const codigosOTIC = ['UNTELS2026', 'OTIC-CICTAI', 'PONENTE2026'];

  for (const codigo of codigosOTIC) {
    const exists = await oticRepo.findOne({ where: { codigo } });
    if (!exists) {
      await oticRepo.save({ codigo });
      console.log(`  Código OTIC insertado: ${codigo}`);
    } else {
      console.log(`  Código OTIC ya existe: ${codigo}`);
    }
  }

  // ── Ejes Temáticos ──
  const ejesData = [
    { nombre: 'Ciencias Físicas y Tecnologías Nucleares Aplicadas', icono: 'fa-atom' },
    { nombre: 'Ciencias de los Materiales y Nanotecnología', icono: 'fa-cubes' },
    { nombre: 'Ingeniería Biomédica, Ciencias de la Salud y Tecnologías Médicas', icono: 'fa-heartbeat' },
    { nombre: 'Ingeniería, Energía y Tecnologías para la Sostenibilidad', icono: 'fa-solar-panel' },
    { nombre: 'Instrumentación Científica, Sensores y Metrología', icono: 'fa-microchip' },
    { nombre: 'Ciencia de Datos, Modelado y Simulación en Ingeniería', icono: 'fa-chart-line' },
    { nombre: 'Ingeniería Ambiental, Gestión de Riesgos y Seguridad Tecnológica', icono: 'fa-leaf' },
    { nombre: 'Educación Científica, Formación en Ingeniería y Divulgación', icono: 'fa-graduation-cap' },
  ];

  const ejesGuardados: EjeTematico[] = [];
  for (const eje of ejesData) {
    let record = await ejeRepo.findOne({ where: { nombre: eje.nombre } });
    if (!record) {
      record = await ejeRepo.save(eje);
      console.log(`  Eje temático insertado: ${eje.nombre}`);
    } else {
      console.log(`  Eje temático ya existe: ${eje.nombre}`);
    }
    ejesGuardados.push(record);
  }

  // ── Usuario ponente demo ──
  let userDemo = await userRepo.findOne({ where: { email: 'ponente@demo.com' } });
  if (!userDemo) {
    const hash = await bcrypt.hash('123456', 10);
    userDemo = await userRepo.save({
      nombre: 'Dr. Carlos Mendoza',
      email: 'ponente@demo.com',
      password: hash,
      participacion: 'ponente',
      universidad: 'Universidad Nacional Tecnológica de Lima Sur',
      voucherCode: 'CICTAI-2026-DEMO1',
      codigoOtic: 'UNTELS2026',
    });
    console.log('  Usuario demo insertado: ponente@demo.com / 123456');
  } else {
    console.log('  Usuario demo ya existe: ponente@demo.com');
  }

  // ── Ponencias de ejemplo ──
  const ponenciasData = [
    {
      userId: userDemo.id,
      titulo: 'Espectroscopía de Rayos Gamma para la Caracterización de Materiales Nucleares',
      autores: 'Carlos Mendoza, Ana Torres, Luis Ramírez',
      afiliacion: 'UNTELS, Instituto Peruano de Energía Nuclear',
      correo: 'cmendoza@untels.edu.pe',
      palabrasClave: 'Espectroscopía, Rayos Gamma, Materiales Nucleares',
      resumen: 'En el presente trabajo se desarrolló un método de caracterización de materiales nucleares mediante espectroscopía de rayos gamma de alta resolución. Se utilizó un detector de germanio hiperpuro para analizar muestras de referencia certificadas, obteniendo espectros con una resolución energética inferior a 1.8 keV a 1332 keV. Los resultados permitieron identificar y cuantificar isótopos radiactivos con una precisión superior al 95%, demostrando la aplicabilidad de esta técnica para el control de calidad de materiales en la industria nuclear peruana.',
      referencias: '[1] Knoll, G. F. (2010). Radiation Detection and Measurement. John Wiley & Sons.\n[2] Gilmore, G. R. (2008). Practical Gamma-ray Spectrometry. Wiley.',
      ejeIdx: 0,
    },
    {
      userId: userDemo.id,
      titulo: 'Síntesis y Caracterización de Nanocompuestos de Grafeno para Aplicaciones en Energía',
      autores: 'María Huamán, José Gutiérrez',
      afiliacion: 'Universidad Nacional de Ingeniería',
      correo: 'mhuaman@uni.edu.pe',
      palabrasClave: 'Grafeno, Nanocompuestos, Almacenamiento de Energía',
      resumen: 'Se sintetizaron nanocompuestos de óxido de grafeno reducido con nanopartículas de óxido de manganeso mediante un método hidrotermal asistido por microondas. Los materiales obtenidos fueron caracterizados mediante difracción de rayos X, microscopía electrónica de barrido y espectroscopía Raman. Las pruebas electroquímicas demostraron una capacitancia específica de 425 F/g a 0.5 A/g, con una retención del 92% después de 5000 ciclos, posicionando a estos nanocompuestos como candidatos prometedores para supercapacitores.',
      referencias: '[1] Stoller, M. D. et al. (2008). Graphene-based ultracapacitors. Nano Letters, 8(10), 3498-3502.\n[2] Zhu, Y. et al. (2011). Graphene and graphene oxide. Advanced Materials, 23(1), 35-49.',
      ejeIdx: 1,
    },
    {
      userId: userDemo.id,
      titulo: 'Sistema de Monitoreo de Signos Vitales Basado en IoT para Pacientes Geriátricos',
      autores: 'Rosa Palacios, Pedro Sánchez, Carmen Flores',
      afiliacion: 'Universidad Nacional Mayor de San Marcos, Hospital Dos de Mayo',
      correo: 'rpalacios@unmsm.edu.pe',
      palabrasClave: 'IoT, Signos Vitales, Telemedicina, Geriatría',
      resumen: 'Este artículo presenta el diseño e implementación de un sistema de monitoreo remoto de signos vitales orientado a pacientes geriátricos. El sistema utiliza sensores no invasivos para medir frecuencia cardíaca, presión arterial y saturación de oxígeno, transmitiendo los datos mediante protocolo MQTT a una plataforma en la nube. Se evaluó el sistema con 30 pacientes del Hospital Dos de Mayo, obteniendo una precisión del 97.3% en las mediciones y una latencia promedio de transmisión de 1.2 segundos. El 85% de los médicos participantes calificó el sistema como "muy útil" para el seguimiento de pacientes crónicos.',
      referencias: '[1] Aliverti, A. (2017). Wearable and mobile monitoring. European Respiratory Journal, 49(5).\n[2] Majumder, S. et al. (2017). Smart homes for elderly healthcare. Sensors, 17(10), 2316.',
      ejeIdx: 2,
    },
    {
      userId: userDemo.id,
      titulo: 'Optimización de Sistemas Fotovoltaicos Mediante Algoritmos de Inteligencia Artificial',
      autores: 'Luis Torres, Elena Vargas',
      afiliacion: 'Universidad Nacional de San Agustín',
      correo: 'ltorres@unsa.edu.pe',
      palabrasClave: 'Energía Solar, Fotovoltaico, Machine Learning, Optimización',
      resumen: 'Se desarrolló un sistema de seguimiento del punto de máxima potencia para paneles fotovoltaicos basado en redes neuronales artificiales y algoritmos genéticos. El sistema fue probado bajo condiciones de irradiancia variable y sombreado parcial, logrando una eficiencia de seguimiento del 99.2%, superando en un 12% a los métodos tradicionales P&O e Incremental Conductance. Las simulaciones en MATLAB/Simulink y las pruebas experimentales en un prototipo de 500W demostraron una mejora significativa en la energía capturada diariamente, especialmente en días nublados.',
      referencias: '[1] Farzaneh, J. et al. (2021). AI-based MPPT techniques. Renewable Energy, 172, 1103-1125.\n[2] Mellit, A., & Kalogirou, S. A. (2018). AI for PV systems. Renewable and Sustainable Energy Reviews, 82, 2990-3006.',
      ejeIdx: 3,
    },
    {
      userId: userDemo.id,
      titulo: 'Desarrollo de un Sensor de Gas de Estado Sólido para Monitoreo de Calidad del Aire',
      autores: 'Jorge Paredes, Karina Silva',
      afiliacion: 'Pontificia Universidad Católica del Perú',
      correo: 'jparedes@pucp.edu.pe',
      palabrasClave: 'Sensor de Gas, Estado Sólido, Calidad del Aire, Óxido Metálico',
      resumen: 'Se fabricaron sensores de gas basados en películas delgadas de óxido de zinc dopado con aluminio mediante la técnica de pulverización catódica. Los sensores fueron caracterizados frente a gases contaminantes como CO, NO2 y SO2 en concentraciones de 1 a 100 ppm. El sensor dopado con 3% atómico de Al mostró una sensibilidad de 85% para NO2 a 200°C, con un tiempo de respuesta de 12 segundos y una selectividad superior al 90% frente a interferentes. Estos resultados demuestran el potencial de estos sensores para aplicaciones de monitoreo ambiental en tiempo real.',
      referencias: '[1] Barsan, N. et al. (2007). Metal oxide gas sensors. Journal of Electroceramics, 19(1), 15-38.\n[2] Wang, C. et al. (2010). Oxide semiconductor gas sensors. Sensors, 10(3), 2088-2106.',
      ejeIdx: 4,
    },
    {
      userId: userDemo.id,
      titulo: 'Modelo Predictivo de Fallas en Transformadores Eléctricos Usando Redes LSTM',
      autores: 'Andrés Quispe, Patricia Morales',
      afiliacion: 'Universidad Nacional de San Antonio Abad del Cusco',
      correo: 'aquispe@unsaac.edu.pe',
      palabrasClave: 'Mantenimiento Predictivo, LSTM, Transformadores, Machine Learning',
      resumen: 'En este trabajo se propone un modelo de deep learning basado en redes Long Short-Term Memory (LSTM) para la predicción temprana de fallas en transformadores de potencia. El modelo fue entrenado con datos históricos de 120 transformadores durante 5 años, incluyendo variables como temperatura del aceite, nivel de gases disueltos y corriente de carga. La arquitectura alcanzó una precisión del 94.7% en la predicción de fallas con 72 horas de anticipación, reduciendo en un 60% los falsos positivos respecto a métodos basados en umbrales fijos.',
      referencias: '[1] Hochreiter, S., & Schmidhuber, J. (1997). Long short-term memory. Neural Computation, 9(8), 1735-1780.\n[2] Ghiculescu, D. et al. (2022). Transformer fault prediction. IEEE Trans. Power Delivery, 37(4), 2891-2900.',
      ejeIdx: 5,
    },
    {
      userId: userDemo.id,
      titulo: 'Evaluación de Riesgos Ambientales en Cuencas Hidrográficas Andinas Mediante SIG',
      autores: 'Diana Quintero, Fernando Delgado',
      afiliacion: 'Universidad Nacional Agraria La Molina',
      correo: 'dquintero@lamolina.edu.pe',
      palabrasClave: 'SIG, Riesgo Ambiental, Cuencas, Andenes, Erosión',
      resumen: 'Se desarrolló una metodología integrada basada en Sistemas de Información Geográfica y análisis multicriterio para evaluar los riesgos ambientales en la cuenca del río Mantaro. Se consideraron factores de erosión hídrica, deslizamientos, contaminación minera y pérdida de cobertura vegetal. Los resultados generaron mapas de susceptibilidad con resolución de 30 metros, identificando que el 23% del área presenta riesgo alto y el 8% riesgo muy alto. La validación en campo mostró una concordancia del 88% con los eventos registrados en los últimos 5 años.',
      referencias: '[1] Saaty, T. L. (2008). Decision making with AHP. International Journal of Services Sciences, 1(1), 83-98.\n[2] Pradhan, B. (2010). Landslide susceptibility mapping. Environmental Earth Sciences, 60(4), 803-815.',
      ejeIdx: 6,
    },
    {
      userId: userDemo.id,
      titulo: 'Estrategias Didácticas Basadas en Simulación para la Enseñanza de Circuitos Eléctricos',
      autores: 'Martín López, Cecilia Ramos',
      afiliacion: 'Universidad Nacional de Educación Enrique Guzmán y Valle',
      correo: 'mlopez@une.edu.pe',
      palabrasClave: 'Simulación, Enseñanza, Circuitos Eléctricos, Didáctica, TIC',
      resumen: 'Este estudio evaluó el impacto de una estrategia didáctica basada en simulación interactiva (Multisim Live) en el aprendizaje de circuitos eléctricos en estudiantes de ingeniería. Se realizó un experimento controlado con 80 estudiantes divididos en grupo experimental (simulación) y grupo control (método tradicional). Los resultados mostraron que el grupo experimental obtuvo un incremento del 32% en las calificaciones promedio y una mejora significativa en la comprensión de conceptos abstractos como fasores y respuesta en frecuencia. La encuesta de satisfacción reveló que el 91% de los estudiantes encontró la herramienta "muy útil" para su aprendizaje.',
      referencias: '[1] Finkelstein, N. D. et al. (2005). When learning about the real world is better done virtually. Physical Review STPER, 1(1), 010103.\n[2] Rutten, N. et al. (2012). Simulations in science education. Computers & Education, 58(1), 18-36.',
      ejeIdx: 7,
    },
  ];

  for (const p of ponenciasData) {
    const eje = ejesGuardados[p.ejeIdx];
    const exists = await ponenciaRepo.findOne({ where: { titulo: p.titulo } });
    if (!exists) {
      await ponenciaRepo.save({
        userId: p.userId,
        titulo: p.titulo,
        autores: p.autores,
        afiliacion: p.afiliacion,
        correo: p.correo,
        palabrasClave: p.palabrasClave,
        resumen: p.resumen,
        referencias: p.referencias,
        ejeTematicoId: eje.id,
      });
      console.log(`  Ponencia insertada: ${p.titulo.substring(0, 60)}...`);
    } else {
      console.log(`  Ponencia ya existe: ${p.titulo.substring(0, 60)}...`);
    }
  }

  await ds.destroy();
  console.log('Seed completado');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
