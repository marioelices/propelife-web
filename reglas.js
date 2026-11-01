// Reglas de la liga (FIPA) · en vigor a partir de la temporada 30.
// Contenido estático: se edita aquí cuando cambie el reglamento.
// Cada elemento: { k: letra o viñeta, t: texto, tabla?: { cab: [...], filas: [[...]] }, aviso?: true }
window.REGLAS = {
  version: "Temporada 30",
  resumen: [
    { i: "⏱️", t: "Partidos de liga", d: "12 minutos · lesiones sí · 5 cambios" },
    { i: "📅", t: "Duración de la jornada", d: "Máximo 3 días naturales" },
    { i: "🟥", t: "Roja en liga", d: "1 partido de sanción" },
    { i: "🎥", t: "Vídeo del partido", d: "Alineaciones + eventos, por ambos equipos" }
  ],
  secciones: [
    {
      id: "liga", n: "1", titulo: "Liga", icono: "🏆",
      grupos: [{ items: [
        { k: "a", t: "El primer clasificado de la liga regular en Primera División será el campeón." },
        { k: "b", t: "Los 2 últimos de Primera División descenderán a Segunda directamente. Los dos primeros de Segunda División ascenderán a Primera directamente. El último de Segunda División descenderá a Tercera directamente, y los dos primeros de Tercera División ascenderán a Segunda directamente." },
        { k: "c", t: "Jugarán la promoción a un partido, en campo del equipo de superior categoría, el antepenúltimo de Primera contra el 3º de Segunda, y el penúltimo de Segunda contra el 3º de Tercera." },
        { k: "d", t: "Si por la incorporación o marcha de algún/os equipo/s se modifica el nº de ascensos/descensos/promoción para equilibrar el número de participantes en cada categoría, en Segunda División siempre subirán 2 y promocionará uno, como mínimo, y en Tercera División subirá uno y promocionará otro como mínimo, haciendo el resto de ajustes necesarios." },
        { k: "e", t: "En caso de empate a puntos de varios equipos, se tendrá en cuenta:", lista: [
          "Golaveraje particular (sin tener en cuenta el valor doble de los goles fuera de casa).",
          "Golaveraje general.",
          "Equipo con más goles a favor.",
          "Fair Play.",
          "Sorteo en la página web echaloasuerte.com."
        ] },
        { k: "f", t: "Solamente se podrán disputar los partidos de cada jornada una vez anunciada por la FIPA en el grupo oficial de WhatsApp. Aquellos partidos que se disputen sin el consentimiento de la FIPA no serán válidos para la competición. Las jornadas no tienen duración mínima, y en circunstancias normales su duración máxima será de 3 días naturales, indicándose el plazo máximo de duración de la jornada en el momento en que se publique en el grupo oficial el inicio de la misma (esta duración podrá ampliarse o acortarse por la FIPA en circunstancias especiales de vacaciones, verano, Navidad, Semana Santa, etc.). Los partidos deberán disputarse inmediatamente sea posible por los dos contendientes jugar, sin buscar dilaciones artificiales o innecesarias para concertar el partido (un partido se deberá jugar cuando se pueda; simplemente, si es más pronto, mejor que después). En caso de que un partido no se haya disputado en el periodo de duración de la jornada, sin causa justificada y no habiéndose detectado o anunciado contactos para disputarlo, se sancionará al equipo o equipos en cuestión con 5 millones, pudiendo reiterarse tal sanción si la situación persiste. También se aplicará la misma sanción en caso de que se avise el último día de la jornada de la imposibilidad de disputar el partido, sin haber contactado para jugar en los días anteriores. Cuando la acumulación de dichas sanciones alcance los 15 millones en una temporada el equipo podrá ser expulsado de la competición, tras votación de los miembros de la FIPA." },
        { k: "g", t: "Cuando, tras haberse producido contacto para jugar entre los dos contendientes, uno de ellos no se presente en la hora acordada (o tramo horario acordado) sin haber avisado al otro contendiente, el equipo que no se presente será sancionado con 5 millones, siempre que tal hecho sea denunciado y acreditado por el equipo agraviado, debiéndose concertar nueva fecha para disputar el encuentro." },
        { k: "h", t: "Formato de partidos de liga: 12 minutos, lesiones sí, 5 cambios." },
        { k: "i", t: "El equipo local creará la sala de juego y elegirá las condiciones climatológicas, de horario, estación, césped, etc." },
        { k: "j", t: "Sanciones en liga: 1 roja (directa o doble amarilla) conllevará 1 partido de sanción. Las sanciones al final de liga serán aplicables a los partidos de promoción, en su caso. Tanto en la última jornada de liga como en los partidos de promoción, las tarjetas rojas acarrearán sanción para el jugador en cuestión en la primera jornada de la temporada siguiente (salvo tras las pujas, en que se resetearán todos los datos). Dado que no salen publicadas en el reporte de partido, los equipos participantes deberán poner en el grupo, justo después de pasar el vídeo del resultado, si algún jugador ha sido expulsado. Si no se informa de la/s expulsión/es tras pasar el vídeo del partido, se sancionará al equipo que ha sufrido la expulsión con 15 millones, y el jugador será sancionado con tres partidos a partir del momento en que se tenga conocimiento de dicha expulsión. Por su parte, el rival tendrá la obligación también de informar de dicha expulsión/es." },
        { k: "k", t: "Lesiones: el bot de Telegram elegirá automáticamente los jugadores lesionados en cada jornada (para ello tendrá en cuenta el nivel de resistencia a lesiones que tiene cada jugador). En caso de que un jugador lesionado juegue un partido, su lesión se prolongará en las siguientes 3 jornadas de liga y el equipo será sancionado con 8 millones de multa. Si tal hecho se produjese en las últimas 3 jornadas de liga, con algo en juego por parte de alguno de los contendientes, la cuantía económica de la multa se incrementará en 8 millones por cada jornada que el jugador no cumpla su partido de lesión. En caso de no haber nada en juego, tan solo se sancionará con 8 millones y las recaídas que correspondan.",
          tabla: { cab: ["Jornada", "Recaída", "Lesión", "Cuantía"], filas: [
            ["Resto", "3 siguientes", "", "8 millones"],
            ["Antepenúltima", "Penúltima y última", "", "16 millones"],
            ["Penúltima", "Última", "", "24 millones"],
            ["Última", "—", "", "32 millones"]
          ] } },
        { k: "l", t: "Alineación indebida: partido perdido por resultado de 1-0 (o el resultado que se hubiese dado si es más favorable para el equipo perjudicado) y -3 puntos en la clasificación. Se considera alineación indebida alinear un jugador que no te pertenece o jugar con un jugador sancionado. En caso de jugar con un jugador sancionado, dicha sanción se pasará a la jornada siguiente." },
        { k: "m", t: "Amaño de partido: si en el desarrollo de un partido se observasen actitudes o jugadas que pudieran entenderse como provocadas para amañar un resultado, afectando a la clasificación y/o limpieza de la competición, previa denuncia de cualquier otro equipo afectado o no, dicha situación se someterá a votación por la FIPA. En caso de que la mayoría de los miembros entiendan que efectivamente se trata de amaño, el equipo o equipos implicados pasarán a ocupar la última posición de la tabla clasificatoria (descendiendo en caso de jugar en Primera) y no obtendrán premio para realizar fichajes en el siguiente mercado. (Se recuerda que los partidos deben quedar grabados en YouTube o Twitch para su revisión en caso de ser necesario. Art 5.J)" }
      ] }]
    },
    {
      id: "copa", n: "2", titulo: "Copa Panagiotis", icono: "🏅",
      grupos: [{ items: [
        { k: "a", t: "Se realizará el sorteo que decida los cruces, el cual se podrá llevar a cabo solamente una vez por temporada, sin lugar a repetición. En caso de ser más de 16 equipos, se jugará una ronda previa por sorteo hasta quedar 16 equipos para disputar los octavos de final." },
        { k: "b", t: "Se comenzará a jugar la Copa durante el parón entre la primera y la segunda vuelta del campeonato de liga, tras el mercado de invierno." },
        { k: "c", t: "Se disputará a eliminatorias a un solo partido, hasta la final incluida." },
        { k: "d", t: "Tan solo habrá sanciones en caso de expulsión (1 partido), y solo para la competición de copa." },
        { k: "e", t: "Se deberá jugar en horario nocturno, clima seco y césped corto, con el formato de partido: 12 minutos, lesiones sí, tiempo medio, prórroga y penaltis, cambios (5)." },
        { k: "f", t: "La no contemplación de alguna de estas normas dará lugar a la anulación del citado partido de oficio por la FIPA o mediante reclamación de alguno de los equipos de la liga (aunque no sea participante en el partido en cuestión), debiendo ser repetido dicho partido." },
        { k: "g", t: "Alineación indebida: partido perdido por 3-0." }
      ] }]
    },
    {
      id: "promocion", n: "3", titulo: "Promoción", icono: "⚔️",
      grupos: [{ items: [
        { k: "a", t: "Se deberá jugar en horario nocturno, clima seco y césped corto, con el formato de partido: 12 minutos, lesiones sí, tiempo medio, prórroga y penaltis, cambios (5)." },
        { k: "b", t: "La no contemplación de alguna de estas normas dará lugar a la anulación del citado partido de oficio por la FIPA o mediante reclamación de alguno de los equipos de la liga (aunque no sea participante en el partido en cuestión), debiendo ser repetido dicho partido." },
        { k: "c", t: "Alineación indebida: partido perdido por 3-0." }
      ] }]
    },
    {
      id: "procedimientos", n: "4", titulo: "Procedimientos", icono: "📋",
      grupos: [{ items: [
        { k: "a", aviso: true, t: "LOS JUGADORES NO PODRÁN SER ENTRENADOS EN NINGUNA DE SUS HABILIDADES. Si se detecta que algún componente de la FIPA ha modificado las habilidades de alguno de sus jugadores, o ha jugado con algún jugador chetado, el mismo será sancionado con 150 millones de multa, pasará a ser el último de la clasificación y en el siguiente draft de fichajes elegirá el último." },
        { k: "b", t: "Cuando se detecte que la media de un jugador es superior a la que consta en el Excel (pestaña INTERCAMBIOS), por no haber sido revisado tal dato oportunamente, el equipo en cuestión será sancionado con 30 millones. (Si se comprueba que tal hecho se debe a una modificación de habilidades o que ha habido mala fe, se aplicará la sanción del apartado 4.a.)" },
        { k: "c", t: "El entrenador será de libre elección, sin coste al presupuesto y sin ninguna otra limitación." },
        { k: "d", t: "Para que un partido se considere válido, hay que pasar vídeo de pantalla de alineaciones + pantalla de eventos de partido, completas, al final del mismo. No obstante, en caso de que, una vez iniciada la transmisión del partido, la misma se detenga por haberse detectado alguna irregularidad (alineación indebida, jugador lesionado, etc.), el partido se dará por disputado, pagando el equipo responsable 25 millones de sanción, además de la consecuencia que conlleve su alineación indebida o lesión (en caso de que sea decisión de ambos, pagará 25 millones cada equipo y el partido se dará por perdido a los dos contendientes). El vídeo deberá ser pasado por ambos equipos, siendo penalizado con 3 millones de sanción aquel equipo que no pase el vídeo, tanto en liga como en promoción o copa. En caso de que ninguno de los dos vídeos del partido sea pasado de forma correcta, el partido no será válido y deberá disputarse nuevamente. Los equipos que acaben de ingresar en la liga tienen una vuelta de competición de margen." },
        { k: "e", t: "Pérdida de conexión involuntaria: si se corta la conexión durante un partido, se buscará la solución amistosa entre los contendientes (se disputará de nuevo el partido, debiendo llegar al mismo minuto de juego con el resultado, goleadores y tarjetas que hubiera hasta el momento de la caída de la conexión, compitiendo de nuevo a partir de ese momento hasta el final del partido). En caso de no haber solución amistosa, se pasarán detalles de minuto y resultado a la FIPA y ésta decidirá el devenir del partido." },
        { k: "f", t: "Pérdida de conexión voluntaria (tirón de cable, rotura de mando, etc.): en caso de que se compruebe que la pérdida de conexión ha sido provocada de forma voluntaria, o que se produzca por la rotura de un mando que corte la conexión, y que por tal motivo no se pueda finalizar el partido ni se pueda pasar el vídeo del mismo, dicho partido se dará por perdido (10-0) al equipo que lo haya provocado, pagando además una multa de 40 millones." },
        { k: "g", t: "En caso de que la conexión del partido no tenga la suficiente calidad (delay, lag, tirones, etc.), el partido podrá ser suspendido de manera unilateral por el equipo que crea estar sufriendo las consecuencias de dichos problemas. No obstante, nunca se podrá detener un partido unilateralmente una vez que se vaya por detrás en el marcador, a no ser que se cuente con el permiso expreso del rival que va venciendo. En caso de retirada de un partido alegando dichos problemas tras ir por detrás en el marcador, el equipo que fuese ganando, si lo considera necesario, pasará informe a la FIPA de dicha situación y se le dará el partido por ganado con un resultado de 3-0 o el que se estuviera produciendo en ese momento, de ser superior." },
        { k: "h", t: "Todos los clubs deben tener puesto su nombre en el equipo que manejan. De no ser así, el equipo en cuestión será sancionado con 3 millones en cada jornada que no tenga puesto su nombre original; los equipos nuevos tendrán un margen de 3 jornadas para ponerse al día." },
        { k: "j", t: "Transmisiones: todo equipo tiene la obligación de transmitir los partidos en los que juega de visitante. Las transmisiones se realizarán a través de Twitch o YouTube, y el partido deberá quedar grabado por si fuera necesario realizar alguna verificación (en caso de que se necesite verificar y el partido no esté grabado, el equipo será sancionado con 40 millones). Los equipos deben tener preparado el sistema de retransmisión antes de la tercera jornada de competición tras su ingreso en la liga. La FIPA sancionará con 5 millones en cada partido al equipo visitante que no transmita un partido cuando el equipo local no quiera o no pueda transmitir, tanto en liga como en promoción o copa." },
        { k: "k", t: "Invitaciones durante partidos oficiales: aquel usuario que envíe invitaciones de audio o de partido a otro u otros usuarios mientras se juega un partido oficial (liga, copa, promoción) será sancionado con 3 millones por cada una de las invitaciones que realice. Para dicha sanción podrá actuar la FIPA de oficio o tras denuncia de alguno de los equipos que estén disputando el partido en cuestión." },
        { k: "l", t: "Bajas temporales: el equipo que, por cuestiones familiares, laborales, vacaciones, etc., no pueda iniciar o continuar una temporada, tiene derecho, si lo desea, a que se le guarde su plaza. En caso de ser equipo de Primera, sus partidos se contarían como descanso y el equipo sería el último clasificado, descendiendo a Segunda División. En caso de ser equipo de Segunda, sus partidos se contarían como descanso, siendo el último clasificado de Segunda División, donde permanecería hasta su desaparición o hasta que otro equipo ocupase su plaza, en caso de no retorno a la competición." },
        { k: "m", t: "En la temporada anterior a pujas (draft), aquellas sanciones económicas que se produzcan por alguna de las cuestiones indicadas en los puntos anteriores de este apartado serán descontadas directamente del presupuesto de pujas, no teniendo en cuenta el dinero que el equipo tuviese en caja hasta esa temporada." }
      ] }]
    },
    {
      id: "filiales", n: "5", titulo: "Filiales", icono: "🌱",
      grupos: [{ items: [
        { k: "•", t: "Cada equipo puede tener un filial (no es obligatorio)." },
        { k: "•", t: "Los filiales juegan en la liga con todos, pero nunca podrán estar en la misma categoría ni en categoría superior a la de su primer equipo." },
        { k: "•", t: "Estarán conformados por 17 jugadores, sin carga al presupuesto (3 jugadores de 70, 3 de 69, 3 de 68, 3 de 67, 3 de 66 y 2 de 65)." },
        { k: "•", t: "Los equipos que tengan filial tendrán un premio de 15 millones al final de temporada, para premiar su esfuerzo, siempre que cumplan con las normas y jueguen sus partidos en tiempo y forma." },
        { k: "•", t: "No hay mercado de fichajes para los filiales; se pueden realizar 2 cambios a final de temporada por jugadores de la misma media. (Si un equipo quiere fichar en el mercado de verano un jugador de su filial, tendrá que pagar por él igual que si fuese un jugador libre de la máquina. Los jugadores del filial no podrán ser fichados por otro equipo.)" },
        { k: "•", t: "No habrá lesionados para los equipos filiales." },
        { k: "•", t: "En caso de que un primer equipo descienda, arrastrará a su filial a la categoría inferior a la suya. Si un primer equipo baja a Tercera, su filial quedará fuera hasta que el primer equipo ascienda de nuevo, momento en que podrá volver a participar su filial en Tercera División." },
        { k: "•", t: "En copa los filiales participarán igual que los primeros equipos. En caso de que coincidan en una eliminatoria, se clasificará automáticamente el primer equipo." },
        { k: "•", t: "Para el resto de cuestiones se aplicarán las mismas normas que a los demás equipos." }
      ] }]
    },
    {
      id: "fichajes", n: "6", titulo: "Sistema de fichajes", icono: "🔁",
      grupos: [
        { titulo: "Jugadores en plantilla", items: [
          { k: "a", t: "Las plantillas estarán obligatoriamente compuestas por 17 jugadores (ni más ni menos)." }
        ] },
        { titulo: "Mercado invernal", items: [
          { k: "a", t: "Al finalizar la primera vuelta de cada liga se abrirá un periodo de fichajes, en que se podrán intercambiar dos jugadores." },
          { k: "b", t: "Los jugadores intercambiados no podrán tener una diferencia de más de 10 niveles entre sí." },
          { k: "c", t: "Por los jugadores intercambiados no se podrá pagar una diferencia superior a los ratios recogidos en la tabla inserta en la pestaña PRESUPUESTOS del Excel de la liga." },
          { k: "d", t: "Las tarjetas y/o MVPs que tuvieran anotadas hasta ese momento pasarán a ser del jugador por el que haya sido intercambiado." },
          { k: "e", t: "Un jugador intercambiado no podrá volver a ser intercambiado hasta la siguiente ventana de fichajes, aunque sí podrá ser vendido a la máquina (en el mercado de verano)." }
        ] },
        { titulo: "Premios", items: [
          { k: "a", t: "Al finalizar la temporada, los equipos de Segunda que no disputen promoción o asciendan a Primera, y todos los equipos de Tercera, recibirán un premio de 85 millones." },
          { k: "b", t: "Al finalizar la temporada, los equipos que hayan ascendido/descendido a Primera/Segunda o jugado promoción recibirán un premio de 78 millones." },
          { k: "c", t: "Al finalizar la temporada, los 4 primeros clasificados de Primera recibirán:", lista: [
            "76 millones el 1º", "75 millones el 2º", "74 millones el 3º", "73 millones el 4º"
          ] },
          { k: "d", t: "Los equipos que tengan filial tendrán un premio de 15 millones al final de temporada, para premiar su esfuerzo, siempre que cumplan con las normas y jueguen sus partidos en tiempo y forma." },
          { k: "e", t: "Por cada tarjeta roja acumulada en liga se pagarán 0,5 millones." },
          { k: "f", t: "El equipo de cada categoría que tenga al jugador que ha acumulado más MVPs a lo largo de la temporada de liga se llevará 5 millones (en caso de empate se repartirá el dinero)." },
          { k: "g", t: "El Zamora de cada categoría se llevará 5 millones (en caso de empate se repartirá el dinero)." },
          { k: "h", t: "En la temporada anterior a las pujas (draft) no se repartirá el dinero de los premios señalados anteriormente." }
        ] }
      ]
    }
  ]
};
