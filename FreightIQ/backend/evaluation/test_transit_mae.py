import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.transit_model import TransitTimeMLModel


def run_transit_mae_evaluation():
    """
    Milestone 1 Exit Criterion Review Script:
    Evaluates Transit Model MAE against a hold-out set of historical actuals.
    Target: MAE <= 2.0 days.
    """
    print("=" * 70)
    print("MILESTONE 1 EVALUATION: TRANSIT TIME ESTIMATION MAE HARNESS")
    print("=" * 70)

    model = TransitTimeMLModel()
    results = model.train_and_evaluate()

    print(f"Total Historical Shipments: {results['total_samples']}")
    print(f"Training Set (Older 80%): {results['train_samples']} shipments")
    print(f"Hold-out Test Set (Most Recent 20%): {results['test_samples']} shipments")
    print(f"Rule-Based Baseline MAE: {results['baseline_mae']} days")
    print(f"Gradient-Boosted ML MAE: {results['ml_mae']} days")
    print(f"ML Model Accuracy Improvement: {results['improvement_pct']}%")
    print(f"Target Metric: MAE <= 2.0 days")

    is_passed = results['ml_mae'] <= 2.0
    if is_passed:
        print("\n>>> RESULT: PASSED (Milestone 1 Transit MAE Exit Criterion Met!) <<<")
    else:
        print("\n>>> RESULT: FAILED (MAE exceeds 2.0 days) <<<")

    print("=" * 70)
    return is_passed


if __name__ == '__main__':
    run_transit_mae_evaluation()
