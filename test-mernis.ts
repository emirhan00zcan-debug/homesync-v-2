import { MernisService } from './src/lib/services/mernis';

async function test() {
    const res = await MernisService.verifyIdentity({
        tcKimlikNo: '11111111111',
        ad: 'EMİRHAN',
        soyad: 'TEST',
        dogumYili: 1990
    });
    console.log("RESULT:", res);
}

test();
