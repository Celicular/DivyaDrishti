try:
    from backend.seeds.runner import run_seeds
    from backend.seeds.demo_users import DEMO_ACCOUNTS
except ImportError:
    from seeds.runner import run_seeds
    from seeds.demo_users import DEMO_ACCOUNTS
