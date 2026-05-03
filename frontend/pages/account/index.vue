<template>
  <div class="mx-auto max-w-5xl px-4 py-12">
    <div class="space-y-6">
      <section class="rounded-loci-lg border border-loci-gray-100 bg-loci-white p-8">
        <div class="mb-6 border-b border-loci-gray-100 pb-4">
          <h1 class="text-2xl font-semibold text-loci-black">
            {{ translate('Mijn account', 'My Account') }}
          </h1>
          <p class="text-sm text-loci-gray-500">
            {{ translate('Dit bedrijfsaccount wordt beheerd door Aitje.', 'This company account is managed by Aitje.') }}
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-loci-black">
              {{ translate('Naam', 'Name') }}
            </label>
            <div class="rounded-loci border border-loci-gray-200 bg-loci-cream px-4 py-3 text-loci-black">
              {{ authStore.user?.name || translate('Onbekend', 'Unknown') }}
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-loci-black">
              {{ translate('Email', 'Email') }}
            </label>
            <div class="rounded-loci border border-loci-gray-200 bg-loci-cream px-4 py-3 text-loci-black">
              {{ authStore.user?.email || translate('Onbekend', 'Unknown') }}
            </div>
          </div>
        </div>

        <p class="mt-4 text-sm text-loci-gray-500">
          {{ translate('Neem contact op met Aitje om accountgegevens of toegang te wijzigen.', 'Contact Aitje to change account details or access.') }}
        </p>
      </section>

      <!-- Git Configuration -->
      <section class="rounded-loci-lg border border-loci-gray-100 bg-loci-white p-8">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h2 class="text-xl font-semibold text-loci-black">
              {{ translate('Git Configuratie', 'Git configuration') }}
            </h2>
            <p class="text-sm text-loci-gray-500">
              {{ authStore.adminImpersonating
                ? translate('Je bekijkt deze koppeling als admin.', 'You are viewing this connection as admin.')
                : translate('Deze koppeling wordt beheerd door Aitje.', 'This connection is managed by Aitje.') }}
            </p>
          </div>
          <div class="text-sm text-loci-gray-500 mt-2 md:mt-0">
            {{ translate('Laatst gesynchroniseerd:', 'Last synced:') }}
            <span class="font-medium text-loci-black">
              {{ gitConfig.last_pushed_at ? formatDateTime(gitConfig.last_pushed_at) : translate('Nooit', 'Never') }}
            </span>
          </div>
        </div>

        <div
          v-if="gitStatus"
          class="mb-6 p-4 rounded-loci border"
          :class="gitStatus.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : gitStatus.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-loci-yellow/10 border-loci-yellow text-loci-black'"
        >
          {{ gitStatus.message }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-loci-black">
              {{ translate('Repository URL', 'Repository URL') }}
            </label>
            <input
              v-if="authStore.adminImpersonating"
              v-model="gitConfig.repo_url"
              type="text"
              class="mt-1 block w-full rounded-loci border border-loci-gray-300 bg-loci-cream px-4 py-3 text-loci-black focus:border-loci-yellow focus:outline-none"
              placeholder="https://github.com/naam/kennisbank.git"
            >
            <div v-else class="mt-1 rounded-loci border border-loci-gray-200 bg-loci-cream px-4 py-3 text-loci-black">
              {{ gitConfig.repo_url || translate('Nog niet gekoppeld', 'Not connected yet') }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-loci-black">
              {{ translate('Branch', 'Branch') }}
            </label>
            <input
              v-if="authStore.adminImpersonating"
              v-model="gitConfig.branch"
              type="text"
              class="mt-1 block w-full rounded-loci border border-loci-gray-300 bg-loci-cream px-4 py-3 text-loci-black focus:border-loci-yellow focus:outline-none"
              placeholder="main"
            >
            <div v-else class="mt-1 rounded-loci border border-loci-gray-200 bg-loci-cream px-4 py-3 text-loci-black">
              {{ gitConfig.branch || 'main' }}
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-loci-black">
              {{ translate('Access Token', 'Access token') }}
            </label>
            <input
              v-if="authStore.adminImpersonating"
              v-model="gitConfig.access_token"
              type="password"
              class="mt-1 block w-full rounded-loci border border-loci-gray-300 bg-loci-cream px-4 py-3 text-loci-black focus:border-loci-yellow focus:outline-none"
              :placeholder="gitConfig.has_access_token ? translate('Laat leeg om bestaande token te behouden', 'Leave empty to keep existing token') : 'ghp_xxxxxxxxx'"
            >
            <div
              v-else
              class="mt-1 rounded-loci border px-4 py-3"
              :class="gitConfig.has_access_token ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'"
            >
              {{ gitConfig.has_access_token ? translate('Gekoppeld', 'Connected') : translate('Niet gekoppeld', 'Not connected') }}
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button
            v-if="authStore.adminImpersonating"
            type="button"
            class="px-6 py-3 bg-loci-black text-loci-white rounded-loci-full font-semibold hover:bg-loci-black-deep transition-all disabled:bg-loci-gray-400 disabled:text-loci-gray-200"
            :disabled="savingGitConfig || !gitConfig.repo_url || !gitConfig.branch"
            @click="saveGitConfig"
          >
            {{ savingGitConfig ? translate('Opslaan...', 'Saving...') : translate('Git-config opslaan', 'Save Git config') }}
          </button>
          <button
            type="button"
            class="px-6 py-3 bg-loci-yellow text-loci-black-deep rounded-loci-full font-semibold hover:bg-loci-yellow-hover transition-all disabled:bg-loci-yellow-light disabled:text-loci-gray-400"
            :disabled="syncing || !hasGitConfig"
            @click="syncToGit"
          >
            {{ syncing ? translate('Synchroniseren...', 'Syncing...') : translate('Sync naar Git', 'Sync to Git') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

definePageMeta({
  middleware: 'auth',
});

const authStore = useAuthStore();
const api = useApi();
const { translate, currentLanguage } = useTranslations();

type GitConfigState = {
  repo_url: string;
  branch: string;
  access_token: string;
  has_access_token: boolean;
  last_pushed_at: string | null;
};

type StatusState = {
  type: 'success' | 'error' | 'info';
  message: string;
};

function extractError(error: any): string | undefined {
  if (error?.data?.errors) {
    return Object.values(error.data.errors).flat().join(', ');
  }

  return error?.data?.message || error?.message;
}

// Git Configuration
const gitConfig = ref<GitConfigState>({
  repo_url: '',
  branch: 'main',
  access_token: '',
  has_access_token: false,
  last_pushed_at: null,
});
const savingGitConfig = ref(false);
const syncing = ref(false);
const gitStatus = ref<StatusState | null>(null);

const hasGitConfig = computed(() => {
  return Boolean(
    gitConfig.value.repo_url &&
      gitConfig.value.branch &&
      gitConfig.value.has_access_token
  );
});

onMounted(async () => {
  await loadGitConfig();
});

async function loadGitConfig() {
  try {
    const response = await api.get<{ config: (GitConfigState & { has_access_token: boolean }) | null }>('/kennisbank/git-config');

    if (response.config) {
      gitConfig.value = {
        repo_url: response.config.repo_url || '',
        branch: response.config.branch || 'main',
        access_token: '',
        has_access_token: Boolean(response.config.has_access_token),
        last_pushed_at: response.config.last_pushed_at || null,
      };
    }
  } catch (e) {
    console.error('Failed to load git config:', e);
  }
}

async function saveGitConfig() {
  try {
    savingGitConfig.value = true;
    gitStatus.value = null;

    const payload: Record<string, string> = {
      repo_url: gitConfig.value.repo_url,
      branch: gitConfig.value.branch || 'main',
    };

    if (gitConfig.value.access_token) {
      payload.access_token = gitConfig.value.access_token;
    }

    const response = await api.post<{ config: GitConfigState; message: string }>('/kennisbank/git-config', payload);
    gitConfig.value.has_access_token = response.config.has_access_token ?? Boolean(payload.access_token);
    gitConfig.value.last_pushed_at = response.config.last_pushed_at || gitConfig.value.last_pushed_at;
    gitConfig.value.access_token = '';
    gitStatus.value = { type: 'success', message: translate('Git-configuratie opgeslagen', 'Git configuration saved') };
  } catch (e: any) {
    gitStatus.value = { type: 'error', message: extractError(e) || translate('Opslaan mislukt', 'Save failed') };
  } finally {
    savingGitConfig.value = false;
  }
}

async function syncToGit() {
  if (!hasGitConfig.value) {
    gitStatus.value = { type: 'error', message: translate('De Git-koppeling is nog niet door Aitje ingesteld.', 'The Git connection has not been configured by Aitje yet.') };
    return;
  }

  try {
    syncing.value = true;
    gitStatus.value = { type: 'info', message: translate('Synchroniseren...', 'Syncing...') };
    const response = await api.post<{ message: string; last_pushed_at: string | null }>('/kennisbank/push');
    gitConfig.value.last_pushed_at = response.last_pushed_at;
    gitStatus.value = {
      type: 'success',
      message: response.message || translate('Sync voltooid', 'Sync completed'),
    };
  } catch (e: any) {
    gitStatus.value = { type: 'error', message: extractError(e) || translate('Sync mislukt', 'Sync failed') };
  } finally {
    syncing.value = false;
  }
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const locale = currentLanguage.value === 'en' ? 'en-US' : 'nl-NL';
  return `${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}
</script>
