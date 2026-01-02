import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage constants
const STORAGE_KEY = '@journal_app:journals';
const DEFAULT_PROMPT = 'What is something you\'ve been thinking about today?';

// Helper function to format timestamps
const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// JournalCard Component
function JournalCard({ prompt, timestamp, onPress }) {
  return (
    <TouchableOpacity style={styles.journalCard} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.cardPrompt}>{prompt}</Text>
      <Text style={styles.cardTimestamp}>{formatTimestamp(timestamp)}</Text>
    </TouchableOpacity>
  );
}

// JournalListView Component
function JournalListView({ journals, onNewEntry, onSelectJournal }) {
  return (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>My Journals</Text>
        <TouchableOpacity style={styles.newEntryButton} onPress={onNewEntry}>
          <Text style={styles.newEntryButtonText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>
      {journals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No journals yet. Start writing!</Text>
        </View>
      ) : (
        <FlatList
          data={journals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalCard
              prompt={item.prompt}
              timestamp={item.timestamp}
              onPress={() => onSelectJournal(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

// JournalDetailView Component
function JournalDetailView({ journal, onBack }) {
  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.detailScrollView} contentContainerStyle={styles.detailContent}>
        <Text style={styles.detailPrompt}>{journal.prompt}</Text>
        <Text style={styles.detailTimestamp}>{formatTimestamp(journal.timestamp)}</Text>
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailText}>{journal.text}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// JournalEntryView Component
function JournalEntryView({ journalText, onChangeText, onSave }) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.entryContainer}>
        <View style={styles.entryContent}>
          <Text style={styles.promptText}>{DEFAULT_PROMPT}</Text>
          <TextInput
            style={styles.textInput}
            multiline={true}
            placeholder="Start writing your journal entry..."
            placeholderTextColor="#666666"
            value={journalText}
            onChangeText={onChangeText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.saveButton, !journalText.trim() && styles.saveButtonDisabled]}
            onPress={onSave}
            disabled={!journalText.trim()}
          >
            <Text style={styles.saveButtonText}>Save Journal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('entry');
  const [journalText, setJournalText] = useState('');
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load journals from AsyncStorage on mount
  useEffect(() => {
    loadJournalsFromStorage();
  }, []);

  const loadJournalsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setJournals(parsed);
        // Show list view if journals exist, otherwise entry view
        if (parsed.length > 0) {
          setCurrentView('list');
        }
      }
    } catch (error) {
      console.error('Error loading journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJournalToStorage = async (updatedJournals) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJournals));
    } catch (error) {
      console.error('Error saving journals:', error);
    }
  };

  const handleSaveJournal = async () => {
    if (!journalText.trim()) {
      return; // Don't save empty journals
    }

    const newJournal = {
      id: Date.now().toString(),
      prompt: DEFAULT_PROMPT,
      text: journalText,
      timestamp: Date.now()
    };

    const updatedJournals = [newJournal, ...journals];
    setJournals(updatedJournals);
    await saveJournalToStorage(updatedJournals);
    setJournalText('');
    setCurrentView('list');
  };

  const handleNewEntry = () => {
    setJournalText('');
    setCurrentView('entry');
  };

  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setSelectedJournal(null);
    setCurrentView('list');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentView === 'entry' ? (
        <JournalEntryView
          journalText={journalText}
          onChangeText={setJournalText}
          onSave={handleSaveJournal}
        />
      ) : currentView === 'list' ? (
        <JournalListView
          journals={journals}
          onNewEntry={handleNewEntry}
          onSelectJournal={handleSelectJournal}
        />
      ) : (
        <JournalDetailView
          journal={selectedJournal}
          onBack={handleBackToList}
        />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  // Entry View Styles
  entryContainer: {
    flex: 1,
  },
  entryContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  promptText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2d2d44',
    color: '#ffffff',
    fontSize: 18,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3d3d5c',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#3d3d5c',
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  // List View Styles
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  listHeaderText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  newEntryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newEntryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  // Journal Card Styles
  journalCard: {
    backgroundColor: '#2d2d44',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3d3d5c',
    marginTop: 10,
  },
  cardPrompt: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardTimestamp: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    color: '#a0a0a0',
    fontSize: 18,
    textAlign: 'center',
  },
  // Detail View Styles
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3d5c',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4a90e2',
    fontSize: 18,
    fontWeight: '600',
  },
  detailScrollView: {
    flex: 1,
  },
  detailContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  detailPrompt: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailTimestamp: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 24,
  },
  detailTextContainer: {
    backgroundColor: '#2d2d44',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3d3d5c',
    minHeight: 200,
  },
  detailText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 26,
  },
});
