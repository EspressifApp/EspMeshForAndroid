package libs.espressif.security;

import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;

public class EspECC {
    private ECPrivateKey mPrivateKey;
    private ECPublicKey mPublicKey;

    public EspECC() {
        KeyPairGenerator keyPairGenerator = null;
        try {
            keyPairGenerator = KeyPairGenerator.getInstance("EC", "BC");
            keyPairGenerator.initialize(256);
            KeyPair kp = keyPairGenerator.generateKeyPair();

            mPublicKey = (ECPublicKey) kp.getPublic();
            mPrivateKey = (ECPrivateKey) kp.getPrivate();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (NoSuchProviderException e) {
            e.printStackTrace();
        }
    }

    public ECPublicKey getPublicKey() {
        return mPublicKey;
    }

    public ECPrivateKey getPrivateKey() {
        return mPrivateKey;
    }

    public BigInteger getOrder() {
        return mPublicKey.getParams().getOrder();
    }

    public BigInteger getPublicKeyX() {
        return mPublicKey.getW().getAffineX();
    }

    public BigInteger getPublicKeyY() {
        return mPublicKey.getW().getAffineY();
    }

    public BigInteger getPrivateKeyS() {
        return mPrivateKey.getS();
    }
}
