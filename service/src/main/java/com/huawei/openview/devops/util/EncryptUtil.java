/**
 * 
 */
package com.huawei.openview.devops.util;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.mindrot.jbcrypt.BCrypt;

/**
 * @author Sid Askary
 *
 */
public abstract class EncryptUtil {


	// Define the BCrypt workload to use when generating password hashes. 10-31 is a valid value.
	private static int workload = 13;
	
	//-------------------------------- key Encryption/Decryption
	public static StandardPBEStringEncryptor jasypt = new StandardPBEStringEncryptor();	

	
	//-------------------------------- One-way Hash of Password
	/**
	 * This method can be used to generate a string representing an account
	 * password suitable for storing in a database. It will be an OpenBSD-style
	 * crypt(3) formatted hash string of length=60 The bcrypt workload is
	 * specified in the above static variable, a value from 10 to 31. A workload
	 * of 12 is a very reasonable safe default as of 2013. This automatically
	 * handles secure 128-bit salt generation and storage within the hash.
	 * 
	 * @param password_plaintext
	 *            The account's plaintext password as provided during account
	 *            creation, or when changing an account's password.
	 * @return String - a string of length 60 that is the bcrypt hashed password
	 *         in crypt(3) format.
	 */
	public static String hashPassword(String password_plaintext) {
		
		String salt = BCrypt.gensalt(workload);
		String hashedStr = BCrypt.hashpw(password_plaintext, salt);
		
		//remove non-alpha chars
		hashedStr = hashedStr.replaceAll("[^a-zA-Z0-9]", "Z");
		return hashedStr;
	}

	/**
	 * This method can be used to verify a computed hash from a plaintext (e.g.
	 * during a login request) with that of a stored hash from a database. The
	 * password hash from the database must be passed as the second variable.
	 * 
	 * @param password_plaintext
	 *            The account's plaintext password, as provided during a login
	 *            request
	 * @param stored_hash
	 *            The account's stored password hash, retrieved from the
	 *            authorization database
	 * @return boolean - true if the password matches the password of the stored
	 *         hash, false otherwise
	 */
	public static boolean checkPassword(String password_plaintext, String stored_hash) {

		//if (null == stored_hash || !stored_hash.startsWith("$2a$"))
		if (null == stored_hash)
	
			throw new java.lang.IllegalArgumentException("Invalid hash provided for comparison");

		return BCrypt.checkpw(password_plaintext, stored_hash);
	}

}
