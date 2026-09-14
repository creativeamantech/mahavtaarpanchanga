import React, { useState, useEffect } from "react";
import { VedicLagnaChart } from "./VedicLagnaChart";
import { BirthChart, computeBirthChart } from "../lib/lagnaEngine.server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CoordinateSelection } from "../types";

function getMsFromLocalTime(dateStr: string, timeStr: string, timeZone: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  let ms = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(ms));
    const p: Record<string, string> = {};
    parts.forEach((part) => {
      p[part.type] = part.value;
    });
    const fYear = parseInt(p.year);
    const fMonth = parseInt(p.month);
    const fDay = parseInt(p.day);
    let fHour = parseInt(p.hour);
    if (fHour === 24) fHour = 0; // handle 24:00
    const fMinute = parseInt(p.minute);

    const diff =
      Date.UTC(year, month - 1, day, hour, minute) -
      Date.UTC(fYear, fMonth - 1, fDay, fHour, fMinute);
    if (diff === 0) break;
    ms += diff;
  }
  return ms;
}

export function LagnaChartView() {
  const [date, setDate] = useState("1990-01-01");
  const [time, setTime] = useState("12:00");
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.2090");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
  );
  const [ayanamsa, setAyanamsa] = useState<CoordinateSelection>("citra");

  const [chartData, setChartData] = useState<BirthChart | null>(null);

  const handleCalculate = () => {
    try {
      const ms = getMsFromLocalTime(date, time, timezone);
      const data = computeBirthChart(ms, parseFloat(lat), parseFloat(lon), timezone, ayanamsa);
      setChartData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle>Birth Details (Janma Kundali)</CardTitle>
          <CardDescription>
            Enter exact birth details to calculate the D1 Lagna Chart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ayanamsa</Label>
              <Select value={ayanamsa} onValueChange={(val: any) => setAyanamsa(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="citra">Lahiri (Chitrapaksha)</SelectItem>
                  <SelectItem value="revati">Revati</SelectItem>
                  <SelectItem value="rohini">Rohini</SelectItem>
                  <SelectItem value="pushya">Pushya</SelectItem>
                  <SelectItem value="mula">Mula</SelectItem>
                  <SelectItem value="krishnamurti">Krishnamurti (KP)</SelectItem>
                  <SelectItem value="tropical">Tropical (Sayana)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleCalculate} className="w-full md:w-auto">
              Calculate Chart
            </Button>
          </div>
        </CardContent>
      </Card>

      {chartData && <VedicLagnaChart chart={chartData} />}
    </div>
  );
}
