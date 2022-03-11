const ExpiryMap = require('expiry-map')
const crypto = require('crypto')

const SAML_ARTIFACT_TIMEOUT = 5 * 60 * 1000
const profileStore = new ExpiryMap(SAML_ARTIFACT_TIMEOUT)

/**
 * Construct a SingPass/CorpPass SAML artifact, a base64
 * encoding of a byte sequence consisting of the following:
 *  - a two-byte type code, always 0x0004, per SAML 2.0;
 *  - a two-byte endpoint index, currently always 0x0000;
 *  - a 20-byte sha1 hash of the partner id, and;
 *  - a 20-byte random sequence that is effectively the message id
 * @param {string} partnerId - the partner id
 * @param {string} profile - the profile (identity) to store
 * @return {string} the SAML artifact, a base64 string
 * containing the type code, the endpoint index,
 * the hash of the partner id, followed by 20 random bytes;
 * this can be used to look up the stored profile (identity)
 */
function generateSamlArtifact(partnerId, profile) {
  const hashedPartnerId = crypto
    .createHash('sha1')
    .update(partnerId, 'utf8')
    .digest('hex')
  const randomBytes = crypto.randomBytes(20).toString('hex')
  const samlArtifact = Buffer.from(
    `00040000${hashedPartnerId}${randomBytes}`,
    'hex',
  ).toString('base64')
  profileStore.set(samlArtifact, profile)
  return samlArtifact
}

function lookUpBySamlArtifact(samlArtifact) {
  return profileStore.get(samlArtifact)
}

module.exports = { generateSamlArtifact, lookUpBySamlArtifact }
