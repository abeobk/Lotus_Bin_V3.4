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
        return {
          time: `2025-10-01 12:${String(
            Math.floor((Math.random() * 100) % 60)
          ).padStart(2, '0')}:${String(
            Math.floor((Math.random() * 100) % 60)
          ).padStart(2, '0')}`,
          model: `Model ${String.fromCharCode(65 + Math.random() * 5)}`,
          body: String(Math.floor(1000 + Math.random() * 9000)),
          seq: String(i + 1).padStart(3, '0'),
          res: Math.random() > 0.1 ? 'OK' : 'NG',
        };
      }),
    };
  },

  generateLogs(nlogs=5){
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
      return Array.from({ length: nlogs}, () => ({
        l: levels[Math.floor(Math.random() * levels.length)],
        m: messages[Math.floor(Math.random() * messages.length)],
        t: new Date().toISOString().replace('T', ' ').split('.')[0],
      }));
  },

  generateImage() {
    return 'UklGRiA7AABXRUJQVlA4IBQ7AABw5AGdASrYAu8BPpFEnEolo7IrpfNq0kASCWdu1DmMaoYptvcHvlXdRutszq79Ad7fB3g1zy49fgAG9YRh1Il/f66Dv/b6C/j/+F4Pv891vo6VdNZiIy80aNKnV/IUjYJP13WxP7oPRXmvcvpdzsmkyIJPRg2VyNce7ns2B4LWhTf8la/rzqugVunUSKEvUg+0SQ3GuYJ49niAJYlZ1lxkFzEI2nOfJiEePJzbLv0pjofoZAxe+5mU7+l3HgudLtmc4kS8o2ZGq+o3AiMIUSIaheN/XR3jm3mc5ftzSVOMANt72jHOE5LoOdIau4/vxowW5AtjoxuF7DQak8jtRzs3fPTsWKTPHM7SQ8cobiCg2+bMdk5mCOWDkMrfT//gQyOtbbbe0ygicYZgAkknc+dAW69Jy4BXC4IID1obJUkExVRjWjxJQU06j/UU6POZtOUmLQxCIt641WPMYqU1YIbr4qcfeODSsjCFekCxSw4d9+FO2F6yZj1cUVurp3HEeCalaKvUS6jjtiNhitlT3YsI7afOA8XsLBYObC6Mxj6NcVHxi352Nel4RBhpWiRaJGVWDjfpvhw9Gin+vWufcRW+lT/icEowgZANNPcXZzV0kDBotV9Rp4LhL/sDqo4ROo51U0h2PIng6KeEk5Qk81ny9PlzM+0DkA6hG2thywNcya57mVlkFdV7R3Vg9LpIRLna4CRhJXJLmya6YKGp1detfxgcVyl+SOn5hhFalYIrzzzpCq92Wg9intqnEMx8wXYh79kTxpojJJCV90fnrRE0EdtpVNUWI5AYkGx+byqzfeEVaI12vM10kdyO7e7GSw52z59AZZjKB8rUZswnq8qRgt+LeEwwuaA9O1zvlMU5s7mm0v29fNFd2In3kq/kEJtPSZSM24jkNVv4pU8oFLyv2Vtwm4HcKQYlv/5dn4eRD/u/i8cNb8hoat9YfZ2cKk0LW2SeNEuOWszaw7rZQ9wTk41DEmhu1oJQ3y7I7UsS+06j6WdZRoDYaMJKMHtWRqvqqHij7+E74vOOdKfBKTgW1rbBI1JYvNKmqm3AX6+tnG6xtmVbiq9b3FnjsKChIOWYP0HPsdD4NqYh3UlpiuvJCN5FFdTJt9b3hy7JhHVwSfxdUoRWAbgPFMGuksIxVy6+sjgIur4ll5Q8r0RcomRShde95OPTXaRIvToixFz3K1S9Vzc/6eaeFNsCxKYdEHnVsb0nha6IanUggNYNFqvqO+LsoW1iGWBdlJrUfhKdt1DvX+6htEnMqRkSA+kK9rRe6PbkLUte1TquVh+iWmmYwduFcRq/JoMx9SQAoZvHQAPOxc2oDWAH27EADVY3xKIH7svCTZsQRfjtKXe3B0DzTgYE8A7dElG3nW+O+eSrhx5b7OI0ji/drwQEGlSSaflij9lG1jy7CNSyPKoh9Mj+3JMtBBvij8tYYfcfD2J/aUR4FAxVhCT0nRq/+L61C30zHd03jbj52k4pYQu7TD+19iMNym/fi6PGFQSIIFpy/n5NPX/jztnhSC+kxYZKYYNTKr+fl6XiqBdap/7KFMsXeES+H94jGlb1oA8shAR/iin8UXq7UUXbKr5Hvl6PdXye+HY+mR8XI6KUbWrM4kANa6JW+zzMh3ehG2OraYu74kR+bq8UKJUXbHkZlhPt30K7BTO/jbdcyNPFog9xcXd804lFMa5vgUEkrVo7iTDQJiN/pfLJtCV/sw4zSi/6nqCMI3/YZIZlHabo7ljcr+zSpvrN7asbTaExS2yWDKNlGx+X2D/KrxMpESI81fr7pvrj4OqNHiwN4gF3oGQjFIasJ4XVIZu0/L5D++WM0XoAIiw6UHzrYbTnJQ7To8TjtMI9pskUVMJgbYcP8298lvN023rUXheTTX/Mzn7+HjQrzho8X0b4YGjrAsozAGYphcPGNj5lDtDVcZG5E/grB3DH6MQf7W4tUI/s2Uy7NHULvXCbbLy0UJobrG7+MRBgT0fHutRoL4wM1n6lR/d43eqHjFKd8E8y3uumGVd9ZayqoG5gzIdOBxbSIskwMNHhRh3V9lSkMbpr7A+eu8ioCzWaesUVcKIUVN646+8jomjTjVT6ltJjfGs5i1nXcju1fZ5oDKmm5TXvcRfdv69RDiufDXecaUvPf487RTukwKwGETyaqjr1wyk2VzBfCMv5qct3B9txLh33jaRhuxAEROjXAvQL9LohFmz+aURJbTMmoK8kGGTyhaK9P44RZXl9GZyN83MZrYIvYvE0YgMnwPH3I7kdyPJ2iXKZAXON2mn6SRzm2OoF/oLvv/nzOM8Kc8/RVzvFkPQ46kyWXPILyYqJ+exTvY7YWyclFoVUsBfqAo/IH+1bVVNt6LO9csprXQIpRvmJ4NPjD3JrKW4J69rR2AfZn6UbtBsQxB/tyrl+BIia73QqOk3gEFcs7LFUjPdSUsJu47Mw1dLMGMLQpNrh2037H3vRS5sL0d7POutYt76lk7OtXcghgPh0MEaWdd0hZC3HJhHPvn0OGGITjgt04rudsF0mD0WnzAvqNlGyjZRtuIlFsShwamcwdcY/OJxfy0/q9JWTvONEwinm7xwTjayAnAazdHiP8NCVvSMfJ5mpJVSEAkQnsMO8ZDnjpsiSnPkb+cha6HDK36SDdDxJFieyO5HcjuRfBamV2WitBv1iL3p7vcdmBxE7A0Z6/QupxGFWfGX163yuAITJxJSc+j0BDafozEB+Ej9rI2sEwuMAVfg/oQWeiQ8JGcKgUbh5A0v9ibiwveUG97VJsD01GyjZYEhXkyYigvZZ0UO4coew9xtMXrlXNFrYkhMZeucw9wOU9QNoey7QAJdmxQRPJa9u19jTCgtdKWIsT2B0W+j+4LIhs7NaMKhwPAbRQ/3u0zfu/1w9VzH0yNV9R4jJWzTjJMLmqCs/bX0EvrfvZDZaTg/fBvk3PJ6f+5PYorOQOLhgxdbDEgc6YegMbcoc8yH4a9mPmAZRAm6k8YfSR/GpY1dSLcXndthtvsP07oBfUbKNlHiMQiCLBgzrcNVTGmrFinSZ4gsSo3HXpNeLREMofsjMc6LWdoOYo+Oq2I9NbHHRLu+fQkUnt2IaoplzMAmUDOHdOlTlp9SIPgo7YW0wdAQ+mRqu9lcBl6KLC4mC0cg2eNUCkEwGso1CAWX+PzxErtJFEeFwn7A6Df/5j0dAE4d9fFN9cxbxaTWclkZDK2ej8srS2cqHAP9K5duYzMgalm4Z+zscYnTuQQHtLkU4CLRQuHQewrENVRAwZNC8JtX1qGmo2UbKRFE9CWwPIsZUFDsNg6JTV8VhpQJA96QtZqo7Y45KcfOpolWrZVIj/NlwyMIT+ohUM2r1g6W2smGbExrBqsAKnRtflwx6dwITFVOApreP0qvixyGOr3JxGbY6QGDOMOEwN+YF+FSrfpPR4uihRMQf7cqjHfPDA5cwHVoeaLCj807BCwLLdImtnb1VpT+yYczX4La/DLmfCMEUGEwmOFmNYUW/CZZKcktgJKugQIK+qw7w1+9fTwxjOE2r+GWS/q+dli7TBLIE21KNsZLWxSxxz3RloBMslGGNX4iMOb287yWrb9fReddyO5F3EofrHr8pmreiS3FPvWVYkkOq1Uue5rn0YAQ7O/W67lf1JVqNqTxcuVE6KaJQpmVNdwHDrxFEEyWlWQNJV9nX7P3RCOo57j4pkw3ZKasrxZFJwPGRi2srvnROvkemrFgy2ZS6AdIcKV+UYd5P5W2hPMuIci11CBkrZoNOXqNShYhBeSdGmycsbACdky637ks7O1rOuPpmj3WV2XEUI7xBqB9EWRafUxQxIYdWB6rGiNwV/+gsHerDrb7hXXccPEiMeLZbfKLslogSv/+E6A2PBJOPnmKbsIkGCeS+ULJgp4emg8VcY9fEpTVN4H8yWsb7dcQdVGOyF+qvcknIMVMOuiEjTKNFi7nwCnqWIdXjuo6DLWPTxuDZx3I7kfSn3BXQVpA/Fx2ZG89ZERM2TgpdlVtTrHKDzqjqxCguNG2ZUFpE3+s6onpRiBlhpUZh1UVIsUqXJjLcuyJu3NkjoClB8aihl8dqbJ2Pb/O5VrxU6zQ6i83+KtArfKmNPvnKrgrth+tcHtV9sH7/bSqi1bqvDsIJunN9tVN5owX6eNHepyzd+b7S78vqGb2+SPawChnFH561HVBn7h82sikyjHjrRv7CVZd8WCbLCo3it++6w1y6XS5EOZ57rAQHyGlUpqOIcd5Mao3P+Cjvi1Pw9EvKvb0fADvJdkd23OD0bp3MZbE+0GB2yESZuEYhYS7N5ABxbAO+wZ/ZFJNqyNV9Q3L5DBZ6aiSzRGW/k/WqbrOHbIj4+/BT5DR7Zc9PYOfuzZhqV3tE8nBAJF0YH2BcwZDRSg+BwF3q2hohk2U7qNkWwquYu/cqvj2+wHseF0i/fZgWLrF95C3NNYs1AKM37hqy4ok6NbykYvpsIvoqOKJ0j+FiKzrkBZUpRfKQTevFLlFNW8O4xAy7ZpljNFCqnOTo7Q/Cp+7ATVmOodV92P2rqavYHTpxz+n7hHiIfTk6mf37vlhsm3zqS6Lu95SRC5qN0m4Q3Kc22o5GcxCd261rTDlsZeNlFpG4GZUCnzRbzl/WbIpgMu53EI0P6VyQtGfzPjrlhr760qOXhk7V45lVEeV2E9Fdi4H4AuQh9Y3tyqw2Ase2pP3SaSAdl5JAbDu83ewNVeXlROHFte8DFIuynjZCBu2hWhh5PZVhRknNz02TQx8VjdZAAUIRov0VSIVztw/S3rSmTmtDws0Ja1KNHNR0ZRB4o+euQ94k9kYkMkAjNZ4LfyU6XFASXuLSOa64r8+sEXxHL/v8uyoza7GHn9LoRLiCh5InCL4EfP66Sp8KI/whhRIG6jlEwFlxBW2LMswQTrdIOk7i+xczT6u1kPh5Jn1fS2XOWTVqUi6RgVdl1sNCKvBMj3STDFJca0egZ508QayQjaQHki8UHR9lTSZWxLc5hTRdisbT6R/V5IZ7uHUNeLoDGFWCXMpdC/oPnr5/cqFGkL8Q1/jyfWV9r24S+qhJ7VRVoBeY7GALt5wwdDlEaVuDz1e8yLD82S5cJMGXs5ZrZ8LuBV6OQ/0/Xm62pt1Dtk8/4eLrselHQSbjlGj8urA9CDwtPSls82NiqgO71zul4Z/q8KxsBCrRi2FlOnetitdiAAD+/RpY1+bPxG+BbSc35PiwASLlwjd72Yz9fdlU7+FekMvEODSoqHWlW1+FhDFsXOQnQdhhlsYo/AMNwpuT76Y021kK9pa/LyELR7ClY06odqK9KQag8CUOyKvQ1W1y87CuCGzeE+D/4sSOPXF6BsSYsedNDSMFfbjOeE9NJc9t4naWR/ry6fuAQkvytlomT9gBtBayMuu+JjZ0Vekqehp9eIx98/+IWonYWiEs6KQz50I3TxQEIZkb1P4EI0KGdXXEoP2VQrOvyGsiE93zbwoRAORbu/4VMuAB4VuP2HhbA3Xb0zKZpxv/HGEQK3nIg9oRK3FIenK+T/+baMWlY5m7R9op2aupgZey4cD2vsIq5UIwOtK6kifoiH6EO7CgIyBvkIvXvPyoK48HNABj/YlCZ527KG4VFXltdOhPKfSTS3AfgZje0g2lWwcoaPezdvzyFJw69Ss7gQiPQCDTWWhgwF62D2HZR/Jn2jltmoQ0skx4Ud3SmcQC9xTOEq9wbYQyph0BWVBR7uzqEPYEs7lX9eabvJREbpBwfTHbSHqMBoMtMLTcLTSDdC4aTWUR/8jTn3eafDxJjAKElsH1EOq2m/D9+Ozw/A/HIXTo+nVxpNA/qpWbucjKj0GX4v4bD+1Lpna6K9do6rPUqPAHQvJcHt/PxGSBuxCu5AIPRO/48PhBjXPV5U5Yu0vp+N+epNNtfklSbogEC+6PyaDaXPazdf4ZW+JROoFTW3zfMxVofkO7GNvB1yxBs+M/dV44Ww+s4vT0qM3qzmqdXqYTY+40g+4QrKQoXz/TSRzRqrqzHatSTP6oSk3fTxe0FulR7akC5ldWUhiPa1x+zEOOVp86IkNONrTQXRhq4xuj07SKSuWBtx6APqPmTEnsq+1CM4t9nIIFHG2SiZ+N31jtlMeWJxnckxitCFsTwlODQJXrumW1Fiuv8HGba4jypQkLZLO37o5jgNCuZHZKrLAkLQ8a0wtOGS4CYH7GjICLvQ7F6y2AEPDIkQoj5mQFKool6m2FJR97+/QhbQ0bPI0AAHXIv5iiMMrH2xCpW7K6676IT+lCP9NB+hLnfhAHKn2i2FZFGYfm1KcAPd+tLrZPRq3BAK59Q1CqYrNuLr1hT+TKP1HMgQD7nCSDBmjZueb7H1JHh+dO3psvCWQS7Ide8tv8s9u9uf2Sp8lnIGjfz5YiRo6jVzQF84vvE3TvTIkq40WAasgioaMOqyuQj9olUlo8DDv5uf3sTnKh5xIX92hqO/IdT6I8jaYvqZWRi1RLg4bqhhILJAWzwZc5AY894mNO61u91qTqIBax5fkNFgFD7IsJjFbYAwku8aJnBRA+Gc4oNNOAZZ8Z60h9wd8o3i6UhdhQEtqiiaCPtgyOwek2bTQSOqG39CguZ+VRzKg9+m17mXVPkhQQmdSP2vkniQZpCyHnSzF+7LBVsOtCJ7+fTDR66Y6x5Db9k/jsfJlg1X+tzb4VKysjqdbAldreoABBpLAnO7YkOlZl43LjdXA+mhqQu/kwtMvWfp2EVVDb7lpTzq0HQ2y5I2jHzmHflAP8Wk/mc59JqftesORiyDyq/6YCAwoUkYTUziYbObZAYqBmvDgSxmHAAemNLYgLtgf77fW5gPsmGjTjBPHf1qYAd2VDIcGc6jPtVgrt2ySRdg2FOu05TGIlvvkAGhQ2qAGSJzoSv2MM9IVAwN6EaT57adHOEZqlHGIhrHiSgvC4A1PCrqk1BdsG6l776Kh3e5oD20IGSvpLYTJZ7eZfi0V1zvYUzjArrsUhL9G/Y/lqaz6oSBVnRPISwFVGrwPyOSwpFpzdvv1Ku/tjHR4eEH25eMZJyc3DBiNpH5+FqEfLtaEYgG//+tQFDaRt8HQd4SKEco/TB2x2f94fNrPOK1GjcOfeZJZae28EqxIMQg+F/7G7/kkLIht1Y0ZBlXC0ZgX9t/m4jGLudfTiivmDKpJaVZpYV6mWoEsU9GkOlN4cY5OtuHe4PtT+dSYh1nOCnrsvP/8buqJSe/xZlGdbwCsaNASnJxuaL77kmqGlRMdTJyiYpb2chUL2WUx40o1254xYnIGtWAXGMHo00X/oMfpoSiFBRdwe9BwNVr7Bx5DlPzrRPfoW/6QoY1WwImbRSRaf8kUn1mCqUP+PM7kZ9gNupmY9faN7NURuB0dse8egDKxpiKPGbLSUxs4bWwkHdXByRDAzzxanNtpw/l24rGwT7TYhKSu0XJCy9elakrr07ImuUktGcXWO+100q7IEtwJGrH0Q7Q6E3QCPOyc95HsAAC+W1881WRK+9TBkWhf0WF0b9tBIxHBRRyP0kdQ9hwdg+5t5ANTOsMdBCpNNp2QBitUqTt7PrwxmjBnG1AYAk1ged/8SVlwyBiivc7hOnWxppTbqBssb9SfhikoVyaBx8OCiLiwINPWQW/TkbsVEuHlUD4P6bcJU7xgEr9a8IKhElBCTqvYydiw4+zzzRGjfRVjgcl7w+SB0QoHm7sn9gpyAt2WChuWiC2MmlqClpnqnF7ggc8DJ6siule0rjihmZamDitMgZ4l4yEPwzxVyolQ8k6mzOLb6rUfEcMesoeIAOMiBsFtd9jaMRT+/Wd1JxH1pNQfGpCMo9xJt/35J58zJTjEqqGpxKW+gf4PHJVegs1kenmyuCtTV9HgvbiDL0Z6I+uNlWFHhxeMAl6X1G1vZMgpqeIdopHipFanw0wvZ9ddG0fwb4B0sjBSUE2il1i7/Dku+hPqK674pqZWxYl9+7gehVzRkDE95IBGK+BFZd2evo/vm3phah9JI2N1fSsrJHuD2tcIgb3bdP4XQVVF5TiKFfQA4bz1hukOec7u9k9i07WUhK9PPmJW2fRe2/LjsLoqljcJGgqb/OqXRoGshRbQARLg6Vmdp2SPnbAAImRHZtHYHKmMoelfmBuvLsyjGo3YMq0YgsWqeBKeU0VcE520r918Jk6aXyfUP3k1WzbGSKcPf024EJAdGE5NISnr4PAspfOppBgtya12+brRtTt8cosrZPKA0CTc1mPPPMF0eTh7vZdBedve6UHngwWLnnNqYCfjJ6HN2SPoDvGoVm9qJw+KZJCoUNd8Jcl8yPAaDXoulzdFoRsK6+30vRNHMvwbgg+WtURO1NPcdWgPjfy4q8fmMcDCbcy/QQ037mrNpJ5IbVLsxgnzep2xlP9lJR+3d2F+binSeks1ta5tpNPR2fzwE32/rg0/etjCLtS0Ofpm6QpmDrN1fWPAY/sTh1mfK5JICVMGRRpJlLcjzelevkQ4xxm+iOxU41GrGED2y750Od6dfQ1PP1MswnBvImBaD7XVk5vvipDTI3oGv/67vJaiem0CWd7+6oJaN19atfsi7ABX5G4T+RHeqjmMWO7S41eQEvvPS0A/haPdK4seBoG3b6rPanHkk9v4tRuYSkuxsZvncBTx1sO1ZL3cokg4TbpikJxRMnlK93dSVj0xyHHwT9o3Csp/UtwTOEZCtRx+zgkparKlgWWUIeze/3qwkYhy63X87ogoMXfl+3qcyHD3auaOfGO+U7UCYu0ae0Pl6RPhanO5zwuP/8u27mCtUPX9EQGtuoyssV3ls+caiTfqcd1Rcve6WEOKcMxV8vmDa2imMX0XUq41IL7QAADR7aVLE8+lpsrntGN2AYXGyaOPjp2qw4gkm7VDBEJiAgc+2qf4cHPGcAeOCEOwp/hB+E0QdyxLoi9xlVS7xDeefgRlLENmxnDlgC6Dcq51+4j0LdOXPfNX2ftFgj0uapfYMrJm+xS2TZWWzdPZgRDZstfO69YaT6HjW/cAojy0WSeVe8LILsBdXtUMZ9IeLuZBF+Nptw4oOopZCNLQT2Ya5HD7t5SneoIYs05G6menVlJp8sLMOhyjlNfab+TMQsplmws1L+rGDrqjRGVSBakyh8UFj2s2yCMHsNgmiOotMJzK8S62ick9ubawnml2fpbrpV4GsFGVQU03uCs+VTtr4fkAQKm9wWLiLy530Yt9y18dPjmmBf8YPC8J5hvNWbQYIKPmhUNr8+VR7uSRYVQt37NGWmA+Sb4ceXjtv6Afyl/+FAQQ7A/oADLCzLlepjQryEx9b8eIPh5WmeXWyEN72DuZxtu6NN+9dLaZEMGdJFQ8V4UlZ3JjJT+rXU1lM6Z1sv4vtE+is2ik29gTj9e0dnQVZyGPRdOSoxK1BxrnUuEvfkouLzzLCOC3sez6yMI4HVG5zu3fBsqWnI8kBK6Yxe9paR8osUsv8VZ0VCp3tKZCUvY71UNTqmtMWK6gTPNWROk0tgb50jL8Z29ieUmMvwAwhVrEQ42gN+hkrGQ2zT/IdI2q3t87X4ZU/tmnGyYB27vfrpqbJ7EyEMadWEhCn6480yozEgqqs/buQHuZAh6SbIHTH2jE5ry2mDFRYqenU8C+mfCv3JLyttQAAenD9ptQuw3en1BUD+/wJtOzLtA9lFQ4x4ToXpn82wF8rkncqBRKn3Uv7eaFA9dlUQgBgk4XOPTmq9DadZ5Pf1K9K2aBuzHu6fSshSUddmkbp9fNtx52sq3kt/ZkF0z5HgKWnm6DwcPSQKt0J4aEUXnVTQgYRUc1j435+qlEH8hnCw5stxUmmanR3IOzAEEeDoCqc5hrcXBw90g9ilOjKV2L4187Ibu7zHnTKBNQgQz5QpYMLk0oE3Gcbnfy5Ug1r5ORTmAYM947mW+/2OdvHvMppbPymWdB/YOBwBG4S+V6d3t41OAAWERmjRLGtHADYzRWoT5z/7OHKzif1KBLTQLaBrsOXXOx6HSCO+JtXgI2tRrzj0vxYaWV72r8Z+AZvg4lrTq4IraBvJn9BaREp9U+Kae6jdQXIh+jO2G021coAnXgi0+eK69bC8mD7gSqXfpoaZTTbpQHdImSsCAlEr9Br6a+dFIT0ttfO5wa5VRJ4szU6EKJ+9fXSyU4fQsLM/pD8qnQAny7lTyyoszFOFBUIBBAeJ7t04kkvrnSs5FXwwfgSrVZtjhPNaza/JBtotNzqWpbQ2WTjtLmuzm2qyrhYfGr6kRDhPpS2hCbcWmYLI/8M+fw3xLCQPmH8K86feaTlFq3OW/Enaqgn16vvfJYtc5pflXlYsvmgte6rdsw1gvE978cF/DfsWHZNo6u6F7ljvX3l6cy2/C4jaYnu52IMKQD7wtrvQ0WrVSJhMjlRwz/429Gau4AIGi1NWq0ZUX+MMrEzpNHzZVF08Ux+md9lOpAAACfcpGHVJXd6oaSuPCn5NGK1ME5fKCz9dZ0bGJ5oBR5KcaVgZuW+TBCS1AoAXJ+F7aSlyEn45cgN15aMSPeep3x8PeXxHpYf0m5bWbn3cpbwbnzVLYYhOVmzz5uSIwHTmfsfs+3tHK2E4vxnqk7TdRswJQ/ZXTNLLLBObaQFd+iT/u1Sn9/a+tRGFv1cBM7DRUl7do3NCXjFAtg1zTFb+58HrGO6K7S9joCVBZCULzs7PQ1Bn/sAOkWKCJPAJZrcztwSxY9btXarQIZwupL+zzon+K3iXG+XZ2uYYZnV1Yp3p8CF7uAMr8ui+wGnuUUIZcbaONaKiSOx6zOvoiDhEgfTVs70P4IQvu1lf9UvSwGk7/16NlucZxMMXEs8ySci+e681q99kEuUTqXK4ALFZcONKCIhdi1a3Zx2/+iWXevuaGH7ZMbCia7ow6n8ivUAbOfufmUAsSsMObQta7PJGxSJ0Dr8+4Ui3gzxHA6QHvRIjZrkbCDDEphXlPqyLrSFK8+kCQpE/5tdDUpQC2cLVc7asc2NEycgPTdRMS0Wq5BTREyFb8tBNueXw+PHqz5h0+ryZ4jAAAfj1vcnUs0VcD2JIQBXBuY11VjeuaeJq9v5efYMBDWVB1D6BHfZhr28ob/cRtaiSLyVQNCqhkQ/fvWkN18cPApmuHKqmHmkdMsZleRLqrlOuRmabLLj/8EQ8LTPDSfzqr1zaOQ2U6oVJoMasQCRPhkL35JPAbmzv3JJwzoVWvPydTHzqFl/H413uiKfamc7Mub5/nNyq5r8rcK4gjBo4M+JCc7vLXH1YWZbOdXf0erHatoTSt0osktHzH4afIcaYVFC/TdzVpt4TlWGAoPJoMra8opCT0gqaWj70i4GFnDGZtA8i3DfYHRzYKs2r1mcNRhJTDWRMQkUoAOgRcnRAY747HGobOHjlUXRcbXjzSbyjsG+pTnIc878n/HwmVrUFzKpPBbhz6rlnkMlAPqsc8jw34tF7I1heWLof3Ns9V7G7LhDdrv42/ddITFVlZUFbjZRSm2vYsayPJ7U86aBRdm1S2b97QRUaPmsjSr1u6HSg35rDcay4xhDMfEKM+IJZGCdIZckcjv8dYRkipsC9JdtP6dO0MXYbxQst388DfGkqW93BGvReNy8DbW04ELVRD78StDn7Av29jvQ24yN+IpZe7aDGr5nkX7D3+OirjDv2RiuNavIOLNIwjoNTBnaG5QwRXsKv7kUY3cbVUyvWmGCrVtUEUe5OVCXclwAADvoZ2v+hzqiRkelMSCWmMF05FT6Nrzi076amc99tCwGfUpjBXAtXi65oXogzihIlI7fHaGJIk5eoa3QzfUFiRDUlSNhF12e1nbeX1ULJYEU92V+UdK3bMXEGnsyP0KowAuc2dgz9tmDgDt+FzVwIhy6bc195gkna3ADkt0nZjft8ahKk8PIt6Su7Ij9vuvde2oAXMRz6wZp79KETk5VR1m/QByh+K7gb0e1hj7DygWajcg3TsyAsRAJ09Pt3Q1Xaig/9vC9PwblZ2kFJkk8M+olOEFWEVtjZnSjw72AWtaYJlp0A63IcXs/aELV5u+JOZohVgVipyAixIxc0w0BeytoPVerlbWLJ7P9WnoEdrtIZW1zuWnseNrPER/YN3oBropNOrKFACGlMdpgtSNa9LJXLq6PSeLDYxeXvYgt1bB+Ce6kuwMtLGsi1vrOdbrGNJdxv45BgMK4An1J78jQTRdiPGdzg/yxSTJgYMchD4dsZUAw3eCUBWBVKxOmW/g3KbBHeik/TQeHFJUEy/HAABAkymzxMkxvGOOX0RuGJMxCyu5kbpEKdc4S0uBoEwqh8I64BTlH0suXnpwv96VHn+ljM6PX6BwGwx91L0/W5Ww4h/S9tTSYo3HiTyTO8cGypl8nEjBL0SB+XVFO1kZDB3UE3WfLl3i63N6kkreof5OuBRXVnoBYtvsQuBI9nhwv8tumGDgHYhIdF1sEc4kMEK7XMRsoPay6lrtvjT5ancmD0uGU2w6gF+Jy7A/E/PtEYpoOg3OKsmI/k1bl9UAPt6ZuRojVs60Wm/XV6JTNsA4TfryUhKGS2S3RlsuNOa9uIc7XhGx3A8Yc65coqhahJl3BcCpwnwOrIipHuXSIO+m7pd5HfycV4J1XSDAWf0GV1i3uC7ljY8p8GxU2p8FqKMpWNPwnB8AAACqKB3wownLJiA88yPJeypV4pxgEtENZsljpqm0syq7O8Tt3dR6BQnYoVSu4T2UfTW8M8b906yEFzkQqM0fbexE9/cX/InIK/Yku6BhpXPC9AkTqZT9seYcqJqGh4am7amcUxP5BTx/ab1uC+hceA3sZv7HPsL71YATFWKblbmpkEFMDOlC/Lpg1s3uA9qHiytCH+GBb17nc6VAdplYdF6dvA3FSU6DVachPLfFr2zkQcYh2ZbNiD/WK32doQf4GdTwaE015tHN7Dls7Qw6EVfiVHw672334HR+K93DNfDzfPQ3NgVcoYl/Wx3csZ4zKRRJ5UVPH2O/wd8GBFhSO9bu6kd+qPRJLHMjiSwG8yeS0/71nxF5CaN4sB/hMxSfHqU52YRTKBH1LbhC+RGbjKBQ78Yf7tY/8qyNwlf8GcakOaHDSZwAABEURLKESqTjFEIcU689LVtYQj8VdCeupQGV1Ppkj0mBb0xL88X6O9z6iTt81SVWL1B8eGibJaqhaVAAUOEi2+G5EguYz1PVNCJ2BW9kSXpIpMYKKVYuU6KYdsVF1dVptX8AMcT1g7AmrsbftIp22ljn8BWh+VhF+1b9lB2JePxGCN2gbr+Q3X3aeGcB9mfUseShCtqVRsGqHEdsuZeYSBCJbywvlN1ng/9KxX/SWf3xyX+V0eruH6MAZjV5wbO3W48HooEEvOZ9r0arnh8PUSF1gyqytku29ioGwg9Emgp2OZpFZCAAAP5EAIv8JPYa3tua8LaTqHB0Yt2nzSEdiBjesijphd5QRCIHEkqleevt5eg+SvOGqsXkxgAKJ5bPGV9FW6u2hngzfbr6htoBw0wouQxZhCqjMmOnjdUhgPxHAcfAupDEJPq4LvWgaPIrBSFynuB8iWZiCJ0bZk7RJyM81Hw0yQRnRzBZspZAaez05HvqtvRVASRfprj2wnUHD9OCbh0lFMm1Kyc9lAvIADnUCn5hZzgPkf714FdL6qod6udgEe3K0eV8P8AU2c+c4TF1qGT+mGUqUeMxFJVPJCY5cKP+smZQYUDVVsU8UceYbh1zg7VHEwJki8AKvEkXMi1rwAAHqyWehl0uJhAGvpaX5EUvxt2Y4LxWsIZqwrFXgV5ZDEZ6D1cwSYEPi0vLy5f+EWmsc/1xbFFvmvcJpN/URAv0vU3LvK7R4jJcSQRBUvyM9FhhXrpTIliNVVqAi/dfLH6ySPKxfnqhkiBTwDvCqJQjeYwEOL0XgTVo+mX5/3c6DrgKRrQ+x6A5viMX/ikNyOhpPV/+KD3CKLyrRrWrllq+AIX10dIDi6rgy1+i8JtBxh4rz2YiKhc7PdOPdu6Ul6r8z5uJX/Kox6JMKy8phsUkFrv7QGCemsGQKg690pW3Kemru5EKBMFMpbv9odHLFa5UmljTD5of1yBDz81zeR10ikBeZ+z0F3fuOjpzLOSN5yc/7HwAAAG3STAUQywAD4AABUlRFjWW5p+qogOFLTfA5r5Ne99vLAEZWHSS9icOjdh2ShD3sQEO7cC/9LVYmGhFgSne6K5PnA7BDGN93wBeaNvWDOiOAJOOAPNT4sb33uz99hnkfgrInbFysp0C61B+hhSk/8954wpEBq9rL2H8T+pzAq36s+RlQf0o6X42j/uPaw8ZHRxlDg+TRLowopoXVb417pgyT/9e6hRWIgp2B1YG0yEMP6Vcmoui4IraO/rwf6zv3K0yRIzPgbtwDvgwwIqClurmQjzCJAD7NA/Ac05bBD+xuhjjhxgjh02D0kpJPhfQyzphBsXauRFiflDgAACURwhONXsIAABtiEuNkPRBEh6u3snCkxsCMVurJ7xNseALAeO15HF+pdHkLgOEmld4a3dQT1fSjx1imEULhgXEytAsstriJumnNW/tl5XKtTjdiBrc3CA5A7SM0z3Gz5m8H6N3ks9MCidXYBQhzXO8f4oHuxFqPjmiKPcehD9SUivBQhwEPgGZ0Z0wNgmKXlsnHJ+288VEb8OmNRV+TPCSb/4WKaO9UeE0VPD9uUEYGRoYvOhF0+RIgWa6O9Z4+aKgIl6T4hHrVe08eOFPzI/leqFcdp0J0ULK8bdkAABT4+hwXmAGVYjBV7eK6JuSa/YIC53vTltZL9Gyqo5mIFMwmIauCBGLsuxSwVU8ngNQet8MWHdk61/jSICrVUNT4riJQyWssBfqVUg/xuA/ixVcDn3M/tVpDag48mdTP1ZPfw2yFZlvnzPeT85Za7hWFGiuFrpmmDM70Btv7vhSfEDUpaZfVCwZnpyrrHFzvAv9FvFViBYVoEQWFOJdUPQSI4+x9vVZoGa+O1JEuFeaRgJGAo4gsJXxHCPS2A4o7gKffHlxvLDbt3ek8mWmrHLgwQyBD0C+2i80M+LPJcfQS435L7i+ZbXfazDvBP+2EaPRZ+c51zjaAjB5rPezD/YITb6Uzof7rDg8SqcFjAAADxADH/XzYpcAAAALFocN3BweMsoeMZ9M5Ak91Uz64x7D4Q6+FjlqF37pGBHkOW657BKbhwgFqG5rasdJivtNTOrMoT0I4iwCu+sWmCW+JWeXVTjE2q74DRdLGJrgspHOnAgR6YFgh4rv4+wKk2GmJtl9DCID5hBJ1FKg8CqEf3Ab9xtY1DTbYSm1qDURXmZ1YJk9A3MBrNIbAlkp8RcSt5/Fyr+fbb1VW7JsgIKran/SerGlbYZnKVGZdU4n8tdRx4twnRxxgw3bF/e3DQfNjyYn5SAUJL2teExQKVOaHdqHNUknEJaJVFIoeq6b4BEOm0qscofW3/VdM2ODTK/f8wlfApe7U/4rmKSi88lD2sUVKxUBYyIKKX1jhQ+zk0lwADAICd+xH6gd6oaDETIGUcCCZ8nzS6JcQxUYkPtIfMsZY4/bncqNFYhwB5j/f0qWsyMFae69QRAVKFsdOplbnnIQILrsNtt0QwEd+UF1Go/d34/vpA1wLfs0MSMKVvN27JHyi5pZF5xt9re7V92UrFkJ5gdbmmfsbw/4lilNPrOPi9yLaU4LRrP0M/ApN2eJKl/eQ6zRz7DgLMiP0XypIRA+GgxKuHoGAEyPcjOUDBaJvnr/RPpadsLQKUvHliBQwvQ20uArHX0I0xay1cdf68KZUUNfy8KZ5RIfNMTngjsmHBdZKqGwHsvmGOKpPi9MrlrRYIdwgMoUls5+ENn5mF7w8aWmkleOzY9JYL4Ih3iTs5qIaNM1aUsTDGXU0GuV0HF3NHv7IyuG3WO1lUMITaKMuunbz7qkJg9BfpqD8uwO6c2X19AAAA8xvUApNQUOL/k+qK5PET2rDgPRPB9lKCeiA+7jSKnqUybbKC1lHtBt3jdhh7jfczsPzDSrOlLXjkiop8X/Lba1LvaITRbDVa+MKT2RT4J9Xfc76aYr+ougphr+0Kko+a++Qn9WxYvMzl3AinCWVjrIPAHGmZhPjyBfoyIWxa7SPKs2wv2SrtfNF5OvSircwwCUAtMZYoDuZnrW8aNx2l9jsCm8ZYQlRaQRzeiY2HYDVYC86vkfYq/+MBeXEfF4ixQlhdMAuoA5SoFmCGh4BbHRL2JeKu2AW5FyNri6TTnir1xccF3G66Mrsen6W8LTk8tKR5zzMfyq4bEIpk6ljA1ymIrTZ8OiKos2E0JMcFGSaC+3TtEyuFXWqD2UuBp5uwj3tnKi/LrmJIJgA1fF6kuI0PRoc2891tC+kLDGvlZUCY/SoEHuAAANSCMq6HIHmpSx+J+QZCj2VhzfjKkDz8ge0PNHPNn77RS3WJesV8V9r/7c6buMGFInu6M4uZIk3hr2RxOAVLWmKdCNhmpPpKnwt16+MbwWegVG5lAZSYUn59oToWT30L6b/67MYb7PT15kO8O0ifPT4xuSe5zTjcY5L8ufG6kskBUd9yv35BzPLiOc02bBPNxssSg46x9RxpCZB72n31s1HH+bQbC8XS2CLyW3H7aAxZ/Yg1JBB2KN4iu3nL6DA+LSAw6VQTIZYNXKMuJ+RluMndY3OMtdZi48934S1VKBqCpHwB+cl78WZ65U9Os+5BLqCqE1vn1kHvVgVXkT3pbYwvLbyJGEprtSgXvbrlrYPL+f5uQF/hldfKO5RPQrKt/6LZlrhlkdyvt4ILqtVLFF3w7gtatGQAAH2FAA+5jsYerEXVO3vXMuUkZ6NEPYCvD5rodyyxM4eF3/MHEix1VBr5EXhuednvdNTvm2TuBAKKB60zZDOs2qQGmCi/oslnvKe60QaLtasvDlNcf7+3QGwXiMXVAC1QJmvzVHffd9f1CvzFKkmXvZ4APEospG0BQ5g5NkqmbnCXYDL6laNZdWZ0EGvRKjhjGTbdu8melqvmwDEpST243bssTM6hbfNY+KTQm1oislsoJe0tBbWddPAtQnPuad3Z3OhTcMoM9BhzJWsrSU8x2C2zXUghEKF7Zsd2AUy8umCPusb1DsRXRTx9Bcwtz2T1Qc+IC0uxymjmuN9f8UPDTwk9h5CNgeiajwShj2hJ5rwAijm11Gg/wTJmr4zr+og6v426WGKEwZTUya0eR7QLgJ9Vt9U7dC7iaSb6m0Z/rFRaxXnlvSwO4ADxnWHTib8k/j7rnBgJUt7KnbikeJvGhsjky34t9Uq81H7ZluULlOMp7ywM4KaW22MtdhBt83tq6i06iW8OrTrIOMNR8dJiWavuFKD53sDxG1YnJP8dM8q8JakvT0Zmab4rOCk2/UoGhHEximGPc+i9pK3Y18rvJfRDC3Uid/2xumWf+aRUfJZhLbQk5uOcC+H5dZjKWdkTQw39EG4uodnUMj9wHoOwt9SKR0ruMOMLo2td2v9BPTMw6a8edOyEy/c+MNrxM0qaGBD/SAqFHpSKECmAn/x7beu0rr8pGqxZ1e6TrBwCjRbqRd0aV4Rv6RTt2lA2QK84H6DalMjhcysStD9okXFFr84Ck85pgABJU4zQhtNx5UUUo35HMuNO0aHzM4GZmVyISExIFv8fnhpu8UH7n6aDUPAVrj7fB2rIze9wMf6g13D/sJMmNumdLnHXeqvQUH/aXmJNOlNcuplYj1pwcv2DFCqnRFob+6ksD4Eoyh+zWVourzGaPOf8Jh/NKsXrYKaBCjpTtrKq3sRGhyPj9ApX/l4Q1TbtnxFiXONHAbUN2+f18cDTDNLdCZiOKUZB6pnNGWzxF1LeiH9u4OUjLWkFDiN7uH3/zMN9t/UlZteaGyEQiLUyabte58KciG3yytYMdT2Nu8nWmtOJ55AiL4yN8mHIKW9N5F+/YrLB2ttNulnQ4KXq+LEbzUILcRm/i3XU9epi/BFuqD8S/hKKhUSu6+l2KtgAARK4jPSIcA2B3z6ouYZvDpDVukXI4YENrllDl02mvPWEHboZsQdJlymSl3pCbOULnbOsitfpFIh03xBA/DESj+XkdexHb7wW1pn69o6tMvJFGwUG2jwrW7IZpT67uO/MEv05xkqkZZnsVkOSTdQQ4HZz7mVS+xZRZTEexPwyx7IqCmoHy+4paorJrIDCd+bA7rkgH109o6G4hHQXyjP9Q8gnwJ6YC5sn2yKTDBrpBH23UB7rrmnUFpY4Gp8ZfA8pZ3+pg+sBM4pxaftNasAY6HE4sPg+KpzKxNE7+zkw10zLA7EAyZxR5uU9a8hzT5nhEFuWeIxW9SHCQC16fjCnOJ7vrD/Ayz8FhM0UNKR2h/4uWdndDzDN8gMaZSEBKctZvep+r/ZkhizcrLIVjX5Ucai2bX9l25Cub/pr41AoS2huCvOzy1PqHYhqrsr02f14TCjbpwEziO3JgAA3FeAX2jWIJVlhT7UIqLoii2CUvvtfFtRtJNghVXmQiJSnaXqC8c6PLaphBDtxB+AWQrfnfyAy8BSapVT4fTmnKwjq/ENxIW+YFS8rLQApWH8iLem7YDXhKBUM76V2Ll4Xv8samJOXAWdBgBr3/xVoy6L7o41lO1XzN1lLmBh4O3uoDhAPFotVsWIcAEHvX+cwqpDoH8FqCafUYhEA8rMgsixGc9o8ljH76n4Ohb2xXsz77PUyoWPl2ghnuZAI6hLAROZRHj/XIMLZXOU2bmqUCLcz3BY7qF56jQX7ZrlHDgWeCwkpNcnLxY6p3AMSp4iCp2uh/86oXXDOz7Tz/kx6Yn7+JEVry4NzagdUsRZqDR8SY9N7i277I7uC2FnE72t3bturbXRo3qeniN9efviRd0UuhJWq2UZCxICBz1emrj8DEObk7VFlsn5hEKO2SToX57Y1Ei6ZzQPtCc9OyR+LkomZ6PIngD9zR669zfTaqoxyfGYnuOvhJdLexZQwKMXDImDtyCFqx0nLa0fGEZd4lGnlTfNfr5ey3Yy3QjogIgsTOqDvGKc95xNMynyTOSPKM6eS+PH+9GSZLFa6LFfK/1A0YmaYAZKklw0l0uWWc9pN9YXtdnVJy461cVyLDLEccJ9Zj/s0+2NUcpFjLREZXRzo8AwgQR++rONC+Zomn6jGWqZoYV7xxIP1HUTwsRlg8T9MEE9NRCvOSE2Bze9va2cXt87Qi/+5AtHZLCCgBs4477pLLKxr0c0WtE90EPaKV154aTqVH/5sHCEp2OD0uxlVV63kQob1UkPkP+7yEnIb0S+VeNJKmFmf1rwPlBGAGuOsdbzuITys4jCiaMQ9ZC0mptuzTIEaNHBSs2f7kKc2ytk3D2gg74PDTkNZ6X4rSJX12fWsIxUlXaIRLlJPhgivV+pmVfjZEB1ALDtRUhFYDXMquspfJrOTr4CayWr3O9dg8PsJN68UMssTdRaKJANhKBwa/Yj+HSctor2ygSBIgvj3OXU1NGLwT2DiyICckYNWYAEy27Rxr3hinSJSi9ByoxX90b6oSkqFfAKRPA5tXTcf18QwzH4MafQBSXWxSpZY+WKlyHeuBFxyai9Z/XtmSMX9MuSq9hGTGjTOf6z+8qK1FtArYlG8MRZFYO2MBGZMvzLqixEsKg608H70v9LSp8sbiFXquITKixfSMpaHWG4SxbpyvVbnR4rwKw0n/WcZCzpeP0oxbjQddEfPQTCZ/l965ZDHvUHlQ0NZ6Cz2AAAC9brokaO5T67HG5lT2lMRtwAJVTrAoap3VEjBHIlcSJhY4keqXJFewKlJ65KZVc87RAzErHQUaUkzK8VUENUM0OyibLe495P2JPYkJQMWBy4xIsmI5avtTxA0IESdS+0lAkPR1c5oWwbf7Cam3NW9nph2UvANKxMOcAdKUHrGYKDpkvI2NgDbc1/tbPDekC6Hk38x3XmrEGmy21mVL1hcLVQLZlJ7KW64VmqAOHx3eRt85Wo+HVQlHSFQDoA/JqFpiT/5HPb7W0qWHx0r/8n9h8O98FRSxng19800cpC+mgxLSsa4GGhGXBqL2iKyvBCTpN5828i//MucMe8fmN61xwg9+oycTszaLiMFTrpHtqaIqZ2/vYVkZmquQqoKpeedBB/LXaVJvzNeWgz9m3aaJsbx9lOxOm/JTktJ0Ij0mooaaPHgztLteEYDQm3Z83b5f4V5Dpqryb+gq7Qjk/2oOv2dD+iQs6jI0NVZw3FtMGGFeSi7kg/kABnFNKRHlCU8hKgzOcLRgY15/2/VQEfebczSHNjm1Zk2wMzeAAA'
  },
};

//expose to window
window.SampleData = SampleData;
