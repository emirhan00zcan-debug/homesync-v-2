import { maskPhoneNumber, maskAddress, shouldRevealData } from '../src/lib/security';

const testMasking = () => {
    console.log('Testing Phone Masking:');
    console.log('05321234567 ->', maskPhoneNumber('05321234567')); // Expected 0532***67 or similar

    console.log('\nTesting Address Masking:');
    console.log('Atatürk Mah. Gül Sok. No:5 ->', maskAddress('Atatürk Mah. Gül Sok. No:5'));

    console.log('\nTesting Reveal Logic:');
    console.log('pending ->', shouldRevealData('pending'));
    console.log('accepted ->', shouldRevealData('accepted'));
    console.log('usta_atandi ->', shouldRevealData('usta_atandi'));
};

testMasking();
