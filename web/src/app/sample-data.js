const SampleData = {
  //randomize cycle info with model, vin,seq,tag,status
  generateCycleInfo() {
    return {
      model: `Model ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      vin: String(10000 + Math.floor(Math.random() * 90000)),
      seq: Math.floor(Math.random() * 1000),
      tag: Math.random() > 0.5 ? 'ok' : 'ng',
      status: Math.random() > 0.7 ? 'ok' : Math.random() > 0.5 ? 'ng' : '...',
    };
  },

  generatePinmaps() {
    const plc_names = ['R1.PLC', 'R2.PLC', 'R3.PLC'];
    const input_names = [
      'RESET',
      'START',
      'STOP',
      'FAULT',
      'EMERGENCY',
      'SENSOR1',
      'SENSOR2',
      'SENSOR3',
    ];
    const output_names = [
      'OK',
      'NG',
      'MOTOR',
      'ALARM',
      'LIGHT1',
      'LIGHT2',
      'VALVE1',
      'VALVE2',
    ];
    return plc_names.map((plc_name) => ({
      name: plc_name,
      iomap: [
        ...input_names.map((name, index) => ({
          Name: name,
          Function: 'DI',
          Index: index,
          Text: '',
        })),
        ...output_names.map((name, index) => ({
          Name: name,
          Function: 'DO',
          Index: index,
          Text: '',
        })),
      ],
    }));
  },

  generateResultTables() {
    return [
      {
        title: 'SHIFT',
        cols: ['name', 'fit', 'ovl', 'x', 'y', 'z', 'rx', 'ry', 'rz'],
        //randomize 10 rows
        rows: Array.from({ length: 5 }, (_, i) => {
          const row = {
            name: { value: `BODY${i + 1}`, tag: 'ok' },
            fit: {
              value: (Math.random() * 0.5 + 0.5).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            ovl: {
              value: (Math.random() * 0.5 + 0.5).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            x: {
              value: (Math.random() * 0.2 - 0.1).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            y: {
              value: (Math.random() * 0.2 - 0.1).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            z: {
              value: (Math.random() * 0.2 - 0.1).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            rx: {
              value: (Math.random() * 0.5 - 0.25).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            ry: {
              value: (Math.random() * 0.5 - 0.25).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            rz: {
              value: (Math.random() * 0.5 - 0.25).toFixed(3),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
          };

          // Set name.tag to 'ng' if any other tag is 'ng'
          if (
            Object.values(row).some(
              (item) => item !== row.name && item.tag === 'ng'
            )
          ) {
            row.name.tag = 'ng';
          }

          return row;
        }),
      },
      //generate a diffent table with different columns
      {
        title: 'DIMENSION',
        cols: ['name', 'length', 'width', 'height', 'angle1', 'angle2'],
        //randomize 10 rows
        rows: Array.from({ length: 3 }, (_, i) => {
          const row = {
            name: { value: `PART${i + 1}`, tag: 'ok' },
            length: {
              value: (Math.random() * 10 + 90).toFixed(2),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            width: {
              value: (Math.random() * 10 + 90).toFixed(2),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            height: {
              value: (Math.random() * 10 + 90).toFixed(2),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            angle1: {
              value: (Math.random() * 5 - 2.5).toFixed(2),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
            angle2: {
              value: (Math.random() * 5 - 2.5).toFixed(2),
              tag: Math.random() > 0.8 ? 'ng' : 'ok',
            },
          };

          // Set name.tag to 'ng' if any other tag is 'ng'
          if (
            Object.values(row).some(
              (item) => item !== row.name && item.tag === 'ng'
            )
          ) {
            row.name.tag = 'ng';
          }

          return row;
        }),
      },
    ];
  },

  generateHistoryData(){
    return {
      title: 'Production History',
      cols: ['time', 'model', 'body', 'seq', 'res'],
      rows: Array.from({ length: 1000 }, (_, i) => {
        const isOk = Math.random() > 0.1; // 90% chance of OK
        return {
          time: `2025-10-01 12:${String(i % 60).padStart(2, '0')}:${String(
            i % 60
          ).padStart(2, '0')}`,
          model: `Model ${String.fromCharCode(65 + (i % 5))}`,
          body: String(10000 + i),
          seq: String(i + 1).padStart(3, '0'),
          res: isOk ? 'OK' : 'NG',
        };
      }),
    };
  },

  generateLogs(){
    //generate 1000 rows of test logs
    const levels = ['Normal', 'Debug', 'Trace', 'Warn', 'Info', 'Success', 'Error', 'Fatal'];
    const messages = [
      'System initialized successfully.',
      'User logged in.',
      'Data fetched from API.',
      'Warning: Low disk space.',
      'Error: Unable to connect to server.\nnew line\nnewline',
      'Debug: Variable x = 42',
      'Trace: Function foo() called.',
      'Success: File uploaded.',
      'Fatal: Unhandled exception occurred.',
      'Info: Scheduled task started.',
      'Debug: Loop iteration 5.',
      'Warn: Deprecated API usage.',
      'Error: Null reference exception.',
      'Success: Email sent to user.',
      'Trace: Exiting function bar().\nnew line\nnewline',
      'Info: Backup completed.',
      'Fatal: System crash imminent.',
      'Debug: User input received.',
      'Warn: High memory usage detected.',
      'Error: Timeout while waiting for response.\nnew line\nnewline',
      'Success: Payment processed.',
      'Trace: Entering function baz().',
      'Info: Service restarted.',
      'Debug: Configuration loaded.'];

      //generate randomly 1-5 logs
      return Array.from({ length: 5 }, () => ({
        l: levels[Math.floor(Math.random() * levels.length)],
        m: messages[Math.floor(Math.random() * messages.length)],
        t: new Date().toISOString().replace('T', ' ').split('.')[0],
      }));
  },
};

//expose to window
window.SampleData = SampleData;
