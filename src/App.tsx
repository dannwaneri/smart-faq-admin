import { useState, useEffect } from 'react';

const API_URL = 'https://smart-faq-worker.fpl-test.workers.dev';

interface FAQ {
	id: string;
	question: string;
	answer: string;
	category?: string;
}

interface TestResult {
	answer: string;
	sources: Array<{ question: string; answer: string; similarity: number }>;
	confidence: number;
	responseTime: number;
}

export default function App() {
	const [activeTab, setActiveTab] = useState<'faqs' | 'test' | 'analytics'>('faqs');
	const [faqs, setFaqs] = useState<FAQ[]>([]);
	const [loading, setLoading] = useState(false);
	
	// New FAQ form
	const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', category: '' });
	
	// Test search
	const [testQuery, setTestQuery] = useState('');
	const [testResult, setTestResult] = useState<TestResult | null>(null);
	
	// Analytics
	const [analytics, setAnalytics] = useState<any>(null);

	useEffect(() => {
		loadFAQs();
		loadAnalytics();
	}, []);

	const loadFAQs = async () => {
		setLoading(true);
		const res = await fetch(`${API_URL}/api/faqs`);
		const data = await res.json();
		setFaqs(data);
		setLoading(false);
	};

	const loadAnalytics = async () => {
		const res = await fetch(`${API_URL}/api/analytics`);
		const data = await res.json();
		setAnalytics(data);
	};

	const addFAQ = async () => {
		if (!newFAQ.question || !newFAQ.answer) return;
		
		setLoading(true);
		await fetch(`${API_URL}/api/faqs`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ...newFAQ, id: Date.now().toString() })
		});
		setNewFAQ({ question: '', answer: '', category: '' });
		await loadFAQs();
		setLoading(false);
	};

	const deleteFAQ = async (id: string) => {
		setLoading(true);
		await fetch(`${API_URL}/api/faqs/${id}`, { method: 'DELETE' });
		await loadFAQs();
		setLoading(false);
	};

	const testSearch = async () => {
		if (!testQuery) return;
		
		setLoading(true);
		const res = await fetch(`${API_URL}/api/answer`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: testQuery })
		});
		const data = await res.json();
		setTestResult(data);
		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<h1 className="text-2xl font-bold text-gray-900">🤖 Smart FAQ Admin</h1>
				</div>
			</nav>

			{/* Tabs */}
			<div className="max-w-7xl mx-auto px-4 py-6">
				<div className="border-b border-gray-200 mb-6">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveTab('faqs')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'faqs'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Manage FAQs ({faqs.length})
						</button>
						<button
							onClick={() => setActiveTab('test')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'test'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Test Search
						</button>
						<button
							onClick={() => setActiveTab('analytics')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'analytics'
									? 'border-blue-500 text-blue-600'
									: 'border-transparent text-gray-500 hover:text-gray-700'
							}`}
						>
							Analytics
						</button>
					</nav>
				</div>

				{/* FAQ Management Tab */}
				{activeTab === 'faqs' && (
					<div className="space-y-6">
						{/* Add FAQ Form */}
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4">Add New FAQ</h2>
							<div className="space-y-3">
								<input
									type="text"
									placeholder="Question"
									value={newFAQ.question}
									onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<textarea
									placeholder="Answer"
									value={newFAQ.answer}
									onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<input
									type="text"
									placeholder="Category (optional)"
									value={newFAQ.category}
									onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<button
									onClick={addFAQ}
									disabled={loading}
									className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
								>
									{loading ? 'Adding...' : 'Add FAQ'}
								</button>
							</div>
						</div>

						{/* FAQ List */}
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4">Existing FAQs</h2>
							<div className="space-y-4">
								{faqs.map((faq) => (
									<div key={faq.id} className="border-b pb-4 last:border-0">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<p className="font-medium text-gray-900">{faq.question}</p>
												<p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
												{faq.category && (
													<span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
														{faq.category}
													</span>
												)}
											</div>
											<button
												onClick={() => deleteFAQ(faq.id)}
												className="ml-4 text-red-500 hover:text-red-700 text-sm"
											>
												Delete
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Test Search Tab */}
				{activeTab === 'test' && (
					<div className="bg-white p-6 rounded-lg shadow">
						<h2 className="text-lg font-semibold mb-4">Test Search & AI Answers</h2>
						<div className="space-y-4">
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Enter a question..."
									value={testQuery}
									onChange={(e) => setTestQuery(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && testSearch()}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
								/>
								<button
									onClick={testSearch}
									disabled={loading}
									className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
								>
									{loading ? 'Searching...' : 'Search'}
								</button>
							</div>

							{testResult && (
								<div className="mt-6 space-y-4">
									<div className="bg-blue-50 p-4 rounded-lg">
										<h3 className="font-semibold text-blue-900 mb-2">AI Answer:</h3>
										<p className="text-gray-800">{testResult.answer}</p>
										<div className="mt-2 text-sm text-gray-600">
											Confidence: {(testResult.confidence * 100).toFixed(1)}% | 
											Response Time: {testResult.responseTime}ms
										</div>
									</div>

									{testResult.sources.length > 0 && (
										<div>
											<h3 className="font-semibold mb-2">Matched FAQs:</h3>
											{testResult.sources.map((faq, idx) => (
												<div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 mb-2 bg-gray-50">
													<p className="font-medium">{faq.question}</p>
													<p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
													<p className="text-xs text-gray-500 mt-1">
														Similarity: {(faq.similarity * 100).toFixed(1)}%
													</p>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}

				{/* Analytics Tab */}
				{activeTab === 'analytics' && analytics && (
					<div className="space-y-6">
						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4">Feedback Stats</h2>
							<div className="grid grid-cols-3 gap-4">
								<div className="text-center p-4 bg-gray-50 rounded">
									<p className="text-3xl font-bold text-gray-900">
										{analytics.feedbackStats?.avg_rating?.toFixed(1) || 'N/A'}
									</p>
									<p className="text-sm text-gray-600">Avg Rating</p>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded">
									<p className="text-3xl font-bold text-gray-900">
										{analytics.feedbackStats?.helpful_count || 0}
									</p>
									<p className="text-sm text-gray-600">Helpful</p>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded">
									<p className="text-3xl font-bold text-gray-900">
										{analytics.feedbackStats?.total_feedback || 0}
									</p>
									<p className="text-sm text-gray-600">Total Feedback</p>
								</div>
							</div>
						</div>

						<div className="bg-white p-6 rounded-lg shadow">
							<h2 className="text-lg font-semibold mb-4">Popular Queries (Last 7 Days)</h2>
							<table className="w-full">
								<thead className="border-b">
									<tr>
										<th className="text-left py-2 px-2">Query</th>
										<th className="text-right py-2 px-2">Count</th>
										<th className="text-right py-2 px-2">Avg Time (ms)</th>
									</tr>
								</thead>
								<tbody>
									{analytics.popularQueries?.map((q: any, idx: number) => (
										<tr key={idx} className="border-b">
											<td className="py-2 px-2">{q.query}</td>
											<td className="text-right py-2 px-2">{q.count}</td>
											<td className="text-right py-2 px-2">{Math.round(q.avg_time)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
