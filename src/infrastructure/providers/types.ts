import type {
  CategoryRepository,
  DatasetRepository,
  ObservationRepository,
  ThemeRepository,
} from "@/domain/repositories";
import type { SearchRepository } from "@/domain/repositories/search";
import type { StatisticsProvider } from "@/domain/repositories/statistics";

export interface DataProvider {
  readonly categories: CategoryRepository;
  readonly themes: ThemeRepository;
  readonly datasets: DatasetRepository;
  readonly observations: ObservationRepository;
  readonly search: SearchRepository;
  readonly statistics: StatisticsProvider;
}

export type ProviderName = "postgres" | "api" | "mock";
