const AxpertMonitor = require("axpert-monitor");
import * as influx from 'influx';

let generalStatusPromise: any;


const db = new influx.InfluxDB({
  host: '192.168.1.50',
  database: 'inverter',
 
  schema: [
    {
      measurement: "general_status",
      fields: { 
        gridVoltage: influx.FieldType.FLOAT,
        gridFrequency: influx.FieldType.FLOAT,
        outputVoltage: influx.FieldType.INTEGER,
        outputFrequency: influx.FieldType.FLOAT,
        outputPowerApparent: influx.FieldType.INTEGER,
        outputPowerActive: influx.FieldType.INTEGER,
        outputLoadPercent: influx.FieldType.INTEGER,
        busVoltage: influx.FieldType.INTEGER,
        batteryVoltage: influx.FieldType.FLOAT,
        batteryChargingCurrent: influx.FieldType.FLOAT,
        batteryCapacity: influx.FieldType.INTEGER,
        temperature: influx.FieldType.INTEGER,
        pvBatteryCurrent: influx.FieldType.FLOAT,
        pvInputVoltage: influx.FieldType.INTEGER,
        batteryVoltageSCC: influx.FieldType.FLOAT,
        batteryDischargeCurrent: influx.FieldType.FLOAT,
        statusLoadOn: influx.FieldType.BOOLEAN, 
        statusBatteryVoltToSteady: influx.FieldType.BOOLEAN,
        statusCharging: influx.FieldType.BOOLEAN,
        statusChargingSCC: influx.FieldType.BOOLEAN,
        statusChargingAC: influx.FieldType.BOOLEAN,
      },
      tags: ["source"]
    }
  ]
});

const generalStatus = async () => {
  let axpert = null;

  try {
    axpert = new AxpertMonitor({hid: '/dev/hidraw0'});

    const answer = await axpert.get.generalStatus();
    await writeData(answer);
  } catch (err: any) {
    console.log(err.message);
  }

  axpert.stop();
}

const writeData = async (data: any) => {
  try {
    await db.writePoints(
      [
        {
          measurement: "general_status",
          tags: { source: "node" },
          fields: { 
            gridVoltage: data.gridVoltage,
            gridFrequency: data.gridFrequency,
            outputVoltage: data.outputVoltage,
            outputFrequency: data.outputFrequency,
            outputPowerApparent: data.outputPowerApparent,
            outputPowerActive: data.outputPowerActive,
            outputLoadPercent: data.outputLoadPercent,
            busVoltage: data.busVoltage,
            batteryVoltage: data.batteryVoltage,
            batteryChargingCurrent: data.batteryChargingCurrent, 
            batteryCapacity: data.batteryCapacity,
            temperature: data.temperature,
            pvBatteryCurrent: data.pvBatteryCurrent,
            pvInputVoltage: data.pvInputVoltage,
            batteryVoltageSCC: data.batteryVoltageSCC,
            batteryDischargeCurrent: data.batteryDischargeCurrent,
            statusLoadOn: data.status.loadOn,
            statusBatteryVoltToSteady: data.status.batteryVoltToSteady, 
            statusCharging: data.status.charging,
            statusChargingSCC: data.status.chargingSCC,
            statusChargingAC: data.status.chargingAC
          }
        }
      ],
      {
        database: "inverter",
        precision: "s"
      }
    )
  } catch(err: any) {
    console.error(`Error writing data to Influx: ${err.message}`);
  }
}

process.on( 'SIGINT', () => {
  console.log("SIGINT signal received.");
  clearInterval(generalStatusInterval);
  process.exit(0);
});


const generalStatusInterval = setInterval(async () => {
  await generalStatus();
}, 10000);





