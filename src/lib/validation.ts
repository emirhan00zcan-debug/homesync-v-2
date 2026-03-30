/**
 * T.C. Kimlik Numarası doğrulama algoritması
 * 1. 11 hanelidir.
 * 2. Her hanesi rakamdır.
 * 3. İlk hanesi 0 olamaz.
 * 4. 1, 3, 5, 7, 9. hanelerin toplamının 7 katından, 2, 4, 6, 8. hanelerin toplamı çıkartıldığında 
 *    elde edilen sonucun 10'a bölümünden kalan, 10. haneyi verir.
 * 5. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. hanelerin toplamının 10'a bölümünden kalan, 11. haneyi verir.
 */
export const validateTCNo = (tcNo: string): boolean => {
    if (!/^[1-9][0-9]{10}$/.test(tcNo)) return false;

    const digits = tcNo.split('').map(Number);

    // 10. hane kontrolü
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const digit10 = ((oddSum * 7) - evenSum) % 10;

    // JavaScript % operatörü negatif sonuç verebilir, +10 ekleyip tekrar %10 yapıyoruz
    if ((digit10 + 10) % 10 !== digits[9]) return false;

    // 11. hane kontrolü
    const totalSum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
    if (totalSum % 10 !== digits[10]) return false;

    return true;
};

/**
 * Metni Türkçe karakterlere uygun şekilde büyük harfe çevirir.
 * NVİ (Nüfus ve Vatandaşlık İşleri) servisleri sadece büyük harf kabul eder.
 */
export const toTurkishUpperCase = (text: string): string => {
    return text.toLocaleUpperCase('tr-TR');
};
