const fs = require('fs');
const file = 'src/lib/tithiTattvaEngine.test.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`    expect(TITHI_ELEMENT_MAPPING[1]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[2]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[3]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[4]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[5]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[6]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[7]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[8]).toBe("akash");
    expect(TITHI_ELEMENT_MAPPING[9]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[10]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[11]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[12]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[13]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[14]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[15]).toBe("prithvi");`,
`    expect(TITHI_ELEMENT_MAPPING[1]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[2]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[3]).toBe("akash");
    expect(TITHI_ELEMENT_MAPPING[4]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[5]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[6]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[7]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[8]).toBe("akash");
    expect(TITHI_ELEMENT_MAPPING[9]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[10]).toBe("vayu");
    expect(TITHI_ELEMENT_MAPPING[11]).toBe("tejas");
    expect(TITHI_ELEMENT_MAPPING[12]).toBe("prithvi");
    expect(TITHI_ELEMENT_MAPPING[13]).toBe("akash");
    expect(TITHI_ELEMENT_MAPPING[14]).toBe("jala");
    expect(TITHI_ELEMENT_MAPPING[15]).toBe("vayu");`
);

content = content.replace(
`    expect(periods[0].startElement).toBe("prithvi");
    expect(periods[0].endElement).toBe("prithvi");`,
`    expect(periods[0].startElement).toBe("akash");
    expect(periods[0].endElement).toBe("akash");`
);

fs.writeFileSync(file, content);
console.log('patched tests');
