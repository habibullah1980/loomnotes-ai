const videoId = 'd4a8e29bf4914fa6b21914c628f28941';

async function testLoomGraphQL() {
  const query = {
    operationName: 'FetchVideoTranscript',
    variables: {
      videoId: videoId,
      password: null
    },
    query: `query FetchVideoTranscript($videoId: ID!, $password: String) {
      fetchVideoTranscript(videoId: $videoId, password: $password) {
        __typename
        ... on VideoTranscriptDetails {
          video_id
          source_url
          captions_source_url
        }
        ... on InvalidRequestWarning {
          message
        }
        ... on GenericError {
          message
        }
      }
    }`
  };

  try {
    const res = await fetch('https://www.loom.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apollographql-client-name': 'web',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify(query)
    });

    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testLoomGraphQL();
