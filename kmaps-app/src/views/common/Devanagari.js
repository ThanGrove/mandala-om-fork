import React, { useEffect, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';

export function Devanagari() {
    const trans_el = useRef();
    const sans_el = useRef();

    function convertTrans() {
        const txt = trans_el.current.value;
        // console.log(txt);
        const sans = convertSans(txt);
        sans_el.current.value = sans;
    }

    return (
        <div>
            <h1>Sanskrit Transliteration Converter</h1>
            <p>Convert Sanskrit transliteration to Devanagari Unicode Script</p>
            <Form>
                <Form.Group className="mb-3" controlId="formTranslit">
                    <Form.Label>Transliteration</Form.Label>
                    <Form.Control
                        as="textarea"
                        size="sm"
                        rows="3"
                        ref={trans_el}
                        className="font-sz125"
                        placeholder="Enter transliteration"
                        onChange={convertTrans}
                    />
                    <Form.Text className="text-muted">
                        Enter the transliteration to be converted. Begin typing
                        or pasting and ...
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Sanskrit</Form.Label>
                    <Form.Control
                        as="textarea"
                        placeholder="Resulting Sanskrit"
                        ref={sans_el}
                        className="sa sanskrit"
                    />
                    <Form.Text className="text-muted">
                        ... the Sanskrit in Devanagari script will appear here.
                    </Form.Text>
                </Form.Group>
            </Form>
        </div>
    );
}

export function convertSans(txt) {
    const sanscorr = {
        ṃ: ['\u{0902}'],
        ṁ: ['\u{0902}'],
        M: ['\u{0902}'],
        ḥ: ['\u{0903}'],
        H: ['\u{0903}'],
        ai: ['\u{0948}', '\u{0910}'],
        a: ['', '\u{0905}'],
        ā: ['\u{093E}', '\u{0906}'],
        A: ['\u{093E}', '\u{0906}'],
        i: ['\u{093F}', '\u{0907}'],
        I: ['\u{093F}', '\u{0907}'],
        ī: ['\u{0940}', '\u{0908}'],
        u: ['\u{0941}', '\u{0909}'],
        ū: ['\u{0942}', '\u{090A}'],
        U: ['\u{0942}', '\u{090A}'],
        ṛ: ['\u{0943}', '\u{090B}'],
        R: ['\u{0943}', '\u{090B}'],
        ḷ: ['\u{0963}', '\u{090C}'],
        L: ['\u{0963}', '\u{090C}'],
        ṝ: ['\u{0944}', '\u{0960}'],
        ḹ: ['\u{0963}', '\u{0961}'],
        e: ['\u{0947}', '\u{090F}'],
        o: ['\u{094B}', '\u{0913}'],
        au: ['\u{094C}', '\u{0914}'],
        k: ['\u{0915}'],
        kh: ['\u{0916}'],
        g: ['\u{0917}'],
        gh: ['\u{0918}'],
        ṅ: ['\u{0919}'],
        c: ['\u{091A}'],
        ch: ['\u{091B}'],
        j: ['\u{091C}'],
        jh: ['\u{091D}'],
        ñ: ['\u{091E}'],
        ṭ: ['\u{091F}'],
        T: ['\u{091F}'],
        ṭh: ['\u{0920}'],
        Th: ['\u{0920}'],
        ḍ: ['\u{0921}'],
        D: ['\u{0921}'],
        ḍh: ['\u{0922}'],
        Dh: ['\u{0922}'],
        ṇ: ['\u{0923}'],
        N: ['\u{0923}'],
        t: ['\u{0924}'],
        th: ['\u{0925}'],
        d: ['\u{0926}'],
        dh: ['\u{0927}'],
        n: ['\u{0928}'],
        p: ['\u{092A}'],
        ph: ['\u{092B}'],
        b: ['\u{092C}'],
        bh: ['\u{092D}'],
        m: ['\u{092E}'],
        y: ['\u{092F}'],
        r: ['\u{0930}'],
        l: ['\u{0932}'],
        v: ['\u{0935}'],
        ś: ['\u{0936}'],
        z: ['\u{0936}'],
        ṣ: ['\u{0937}'],
        S: ['\u{0937}'],
        s: ['\u{0938}'],
        h: ['\u{0939}'],
        "'": ['\u{093D}'],
        '‘': ['\u{093D}'],
        '’': ['\u{093D}'],
        '.': ['\u{0964}'],
        '|': ['\u{0964}'],
        '/': ['\u{0964}'],
        0: ['\u{0966}'],
        1: ['\u{0967}'],
        2: ['\u{0968}'],
        3: ['\u{0969}'],
        4: ['\u{096A}'],
        5: ['\u{096B}'],
        6: ['\u{096C}'],
        7: ['\u{096D}'],
        8: ['\u{096E}'],
        9: ['\u{096F}'],
        oṃ: ['\u0950'],
        oṁ: ['\u0950'],
    };

    // For normalization, first entry (2 characters) is replaced by second (1 character)
    const normpairs = [
        [" '", "'"],
        [' ’', "'"],
        ['ṁ', 'ṁ'],
        ['ṅ', 'ṅ'],
        ['ḥ', 'ḥ'],
        ['ā', 'ā'],
        ['ī', 'ī'],
        ['ū', 'ū'],
        ['ṭ', 'ṭ'],
        ['ḍ', 'ḍ'],
        ['ṇ', 'ṇ'],
        ['ñ', 'ñ'],
        ['ṛ', 'r̥'],
        ['r̥', 'ṛ'],
        ['ṣ', 'ṣ'],
        ['ś', 'ś'],
        ['_', ' '],
        ['\n', '$%$ '],
    ];
    const normalize = (t) => {
        normpairs.map((pr, pri) => {
            let re = new RegExp(pr[0], 'g');
            t = t.replace(re, pr[1]);
        });
        return t;
    };

    const getsans = (ch, front = false) => {
        if (ch === '') {
            return '';
        }
        if (transkeys.includes(ch)) {
            return front && sanscorr[ch].length > 1
                ? sanscorr[ch][1]
                : sanscorr[ch][0];
        }
        //console.log("No equivalent found for: " + ch);
        return ch;
    };

    const vowels = 'aeiouṛḷāīūAIURL';
    const ornamentals = "̇, ̣ ̇ ̄ṃṁḥMH'‘’./|0123456789 \n";
    const ignorechars = '()[]-$%√:';

    const normtext = normalize(txt);
    const words = normtext.split(/\s+/);

    const transkeys = Object.keys(sanscorr);

    let sansout = [];
    for (let n = 0; n < words.length; n++) {
        let word = words[n].trim();
        let lastchar = word.charAt(word.length - 1);
        // console.log(`[${word}][${lastchar}]`);
        let sanword = '';
        let isfirst = true;
        while (word.length > 1) {
            let mych = word.substring(0, 2);
            word = word.substring(2);
            let sanch = getsans(mych);
            if (sanch !== mych) {
                sanword += sanch;
            } else {
                let ch1 = mych.charAt(0);
                let ch2 = mych.charAt(1);
                if (
                    !vowels.includes(ch1) &&
                    !ornamentals.includes(ch1) &&
                    !ignorechars.includes(ch1) &&
                    !vowels.includes(ch2) &&
                    !ornamentals.includes(ch2) &&
                    !ignorechars.includes(ch2)
                ) {
                    sanword += getsans(ch1) + '\u094D';
                } else {
                    let stype = isfirst && vowels.includes(ch1);
                    sanword += getsans(ch1, stype);
                }
                word = ch2 + word; // return character to word incase it belongs with next
            }
            isfirst = false;
        }
        sanword += getsans(word);
        if (
            !vowels.includes(lastchar) &&
            !ornamentals.includes(lastchar) &&
            !ignorechars.includes(lastchar)
        ) {
            //console.log("adding viguma", `[${words[n]}][${lastchar}]`);
            sanword += '\u094D';
        }
        sansout.push(sanword);
    }

    let sanskrit = sansout.join(' ').replace(/\$%\$ /g, '\n');
    return sanskrit;
}
