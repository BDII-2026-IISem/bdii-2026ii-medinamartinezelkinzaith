from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from config.database import database_from_environ


class DatabaseSelectionTests(SimpleTestCase):
    def _env(self, engine):
        return {
            "DB_ENGINE": engine,
            "POSTGRES_DB": "ActivaFit",
            "POSTGRES_USER": "postgres",
            "POSTGRES_PASSWORD": "1234",
            "POSTGRES_HOST": "172.21.63.86",
            "POSTGRES_PORT": "5432",
            "MYSQL_DB": "ActivaFit",
            "MYSQL_USER": "admin",
            "MYSQL_PASSWORD": "1234",
            "MYSQL_HOST": "172.21.63.86",
            "MYSQL_PORT": "3306",
            "MSSQL_DB": "ActivaFit",
            "MSSQL_USER": "activafit",
            "MSSQL_PASSWORD": "Elkin1234!",
            "MSSQL_HOST": "172.21.63.86",
            "MSSQL_PORT": "1433",
            "ORACLE_DB": "ActivaFit",
            "ORACLE_USER": "activafit",
            "ORACLE_PASSWORD": "Elkin1234!",
            "ORACLE_HOST": "172.21.63.86",
            "ORACLE_PORT": "1521",
            "ORACLE_SERVICE_NAME": "FREEPDB1",
        }

    def test_postgresql_engine(self):
        config = database_from_environ(self._env("postgresql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.postgresql")

    def test_mysql_engine(self):
        config = database_from_environ(self._env("mysql"))
        self.assertEqual(config["default"]["ENGINE"], "django.db.backends.mysql")
        self.assertEqual(config["default"]["OPTIONS"]["charset"], "utf8mb4")

    def test_mssql_engine(self):
        config = database_from_environ(self._env("mssql"))
        self.assertEqual(config["default"]["ENGINE"], "mssql")

    def test_oracle_uses_service_name(self):
        config = database_from_environ(self._env("oracle"))
        self.assertIn("SERVICE_NAME=FREEPDB1", config["default"]["NAME"])
        self.assertEqual(config["default"]["PORT"], "")

    def test_invalid_engine(self):
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ({"DB_ENGINE": "sqlite"})

    def test_missing_variable(self):
        env = self._env("postgresql")
        env["POSTGRES_DB"] = ""
        with self.assertRaises(ImproperlyConfigured):
            database_from_environ(env)