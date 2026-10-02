try:
    from backend.migration.runner import run_migrations, get_applied_migrations
except ImportError:
    from migration.runner import run_migrations, get_applied_migrations
