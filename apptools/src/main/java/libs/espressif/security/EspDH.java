package libs.espressif.security;

import java.math.BigInteger;
import java.security.AlgorithmParameterGenerator;
import java.security.AlgorithmParameters;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.InvalidParameterSpecException;

import javax.crypto.KeyAgreement;
import javax.crypto.interfaces.DHPrivateKey;
import javax.crypto.interfaces.DHPublicKey;
import javax.crypto.spec.DHParameterSpec;
import javax.crypto.spec.DHPrivateKeySpec;
import javax.crypto.spec.DHPublicKeySpec;

public class EspDH {
    private final int mLength;
    private BigInteger mP;
    private BigInteger mG;

    private DHPrivateKey mPrivateKey;
    private DHPublicKey mPublicKey;

    private byte[] mSecretKey;

    public EspDH(BigInteger p, BigInteger g, int length) {
        mP = p;
        mG = g;
        mLength = length;
        Key[] keys = generateKeys(p, g, length);
        mPrivateKey = (DHPrivateKey) keys[0];
        mPublicKey = (DHPublicKey) keys[1];
    }

    public BigInteger getP() {
        return mP;
    }

    public BigInteger getG() {
        return mG;
    }

    public DHPrivateKey getPrivateKey() {
        return mPrivateKey;
    }

    public DHPublicKey getPublicKey() {
        return mPublicKey;
    }

    public byte[] getSecretKey() {
        return mSecretKey;
    }

    public void generateSecretKey(BigInteger y) {
        try {
            DHPublicKeySpec pbks = new DHPublicKeySpec(y, mP, mG);
            KeyFactory keyFact = KeyFactory.getInstance("DH");
            PublicKey publicKey = keyFact.generatePublic(pbks);

            // Prepare to generate the secret key with the private key and public key of the other party
            KeyAgreement ka = KeyAgreement.getInstance("DH");
            ka.init(mPrivateKey);
            ka.doPhase(publicKey, true);

            // Generate the secret key
            mSecretKey = ka.generateSecret();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException | InvalidKeyException e) {
            e.printStackTrace();
        }
    }

    public static BigInteger[] generatePG(int length) {
        try {
            AlgorithmParameterGenerator paramGen = AlgorithmParameterGenerator.getInstance("DH");
            paramGen.init(length, new SecureRandom());
            AlgorithmParameters params = paramGen.generateParameters();
            DHParameterSpec dhSpec = params.getParameterSpec(DHParameterSpec.class);
            BigInteger pv = dhSpec.getP();
            BigInteger gv = dhSpec.getG();

            return new BigInteger[]{pv, gv};
        } catch (NoSuchAlgorithmException | InvalidParameterSpecException e) {
            e.printStackTrace();
        }

        return null;
    }

    public static Key[] generateKeys(BigInteger p, BigInteger g, int length) {
        try {
            // Use the values to generate a key pair
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("DH");
            DHParameterSpec dhSpec = new DHParameterSpec(p, g, length);
            keyGen.initialize(dhSpec);
            KeyPair keypair = keyGen.generateKeyPair();

            // Get the generated public and private keys
            Key[] result = new Key[2];
            result[0] = keypair.getPrivate();
            result[1] = keypair.getPublic();

            return result;
        } catch (NoSuchAlgorithmException
                | InvalidAlgorithmParameterException
                | ClassCastException e) {
            e.printStackTrace();

            return null;
        }
    }

    public static DHPrivateKey generatePrivateKey(BigInteger x, BigInteger p, BigInteger g)
            throws GeneralSecurityException {
        DHPrivateKeySpec ks = new DHPrivateKeySpec(x, p, g);
        KeyFactory factory = KeyFactory.getInstance("DH");
        return (DHPrivateKey) factory.generatePrivate(ks);
    }

    public static DHPublicKey generatePublicKey(BigInteger y, BigInteger p, BigInteger g)
            throws GeneralSecurityException {
        DHPublicKeySpec ks = new DHPublicKeySpec(y, p, g);
        KeyFactory factory = KeyFactory.getInstance("DH");
        return (DHPublicKey) factory.generatePublic(ks);
    }

    public static byte[] generateSecretKey(BigInteger x, BigInteger y, BigInteger p, BigInteger g)
            throws GeneralSecurityException {
        PrivateKey privateKey = generatePrivateKey(x, p, g);
        PublicKey publicKey = generatePublicKey(y, p, g);

        // Prepare to generate the secret key with the private key and public key of the other party
        KeyAgreement ka = KeyAgreement.getInstance("DH");
        ka.init(privateKey);
        ka.doPhase(publicKey, true);

        // Generate the secret key
        return ka.generateSecret();
    }
}
