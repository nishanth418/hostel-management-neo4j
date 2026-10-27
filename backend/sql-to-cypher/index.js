/**
 * SQL-to-Cypher Module Entrypoint
 */

const {
  translateSqlToCypher,
  normalizeCypherQuery,
  SqlParsingError,
  UnsupportedSqlFeatureError,
  TranslationError
} = require('./translator');

const {
  ENTITIES,
  TABLE_ALIASES,
  AUX_PHONE_TABLES,
  GRAPH_RELATIONSHIPS,
  resolveEntityName,
  resolvePropertyName,
  findRelationship
} = require('./schema');

module.exports = {
  translateSqlToCypher,
  normalizeCypherQuery,
  SqlParsingError,
  UnsupportedSqlFeatureError,
  TranslationError,
  ENTITIES,
  TABLE_ALIASES,
  AUX_PHONE_TABLES,
  GRAPH_RELATIONSHIPS,
  resolveEntityName,
  resolvePropertyName,
  findRelationship
};
