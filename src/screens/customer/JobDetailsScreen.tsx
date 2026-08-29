import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Icons from 'lucide-react-native';
import { JobItem } from '../../components/JobCard';
import { useWishlistStore } from '../../store/wishlistStore';
import { useToastStore } from '../../store/toastStore';
import { useOrderStore } from '../../store/orderStore';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

export default function JobDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useThemeStore();
  const isLight =
    colors.background === '#FFFDF5' ||
    colors.background === '#FFFFFF' ||
    colors.background === '#F8FAFC' ||
    colors.background === '#FFF8E8' ||
    themeMode === 'light';

  const rawJob: JobItem = route.params?.job || {
    id: 'job_sample_1',
    title: 'Senior Full Stack React Native Developer',
    company: 'TechForge Solutions India',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    isVerified: true,
    location: 'Bangalore, KA',
    workMode: 'Hybrid',
    experience: '2–5 yrs',
    salary: '₹12–₹18 LPA',
    employmentType: 'Full-time',
    department: 'IT & Software Engineering',
    skills: ['React Native', 'TypeScript', 'Node.js', 'GraphQL', 'MongoDB'],
    postedDate: '2 days ago',
    deadline: '15 Sep 2026',
    itemType: 'JOB',
    openings: 3,
    description:
      'We are looking for a passionate Senior React Native Developer to lead our mobile engineering team. You will be responsible for architecting scalable mobile features, optimizing native performance across iOS and Android, and working closely with product managers and backend teams.',
    companyInfo: {
      industry: 'IT & Product Development',
      size: '250–500 Employees',
      founded: '2018',
      hq: 'Indiranagar, Bangalore',
      website: 'https://techforge.in',
      rating: '4.7',
      reviewsCount: '184',
      about:
        'TechForge Solutions is a leading digital product studio engineering high-scale mobile applications and enterprise SaaS solutions for global brands.',
    },
  };

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const showToast = useToastStore((state) => state.showToast);

  const isSaved = wishlistItems.some((i) => i.id === rawJob.id);
  const isInternship =
    rawJob.itemType === 'INTERNSHIP' ||
    (rawJob.employmentType || '').toLowerCase().includes('intern');

  // Application Sheet State
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(
    Boolean(route.params?.openApplySheet)
  );
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
  const [applicantResume, setApplicantResume] = useState('Uma_Resume_2026.pdf');
  const [applicantEducation, setApplicantEducation] = useState('B.Tech in Computer Science');
  const [applicantNoticePeriod, setApplicantNoticePeriod] = useState('Immediate (0–15 Days)');
  const [expectedSalary, setExpectedSalary] = useState(rawJob.salary || '₹14 LPA');
  const [screeningAnswer, setScreeningAnswer] = useState(
    'Yes, I have over 3+ years of hands-on experience building production React Native apps.'
  );

  const handleSaveToggle = () => {
    toggleWishlist({
      id: rawJob.id,
      name: rawJob.title,
      price: rawJob.salary,
      category: 'Jobs',
      image: rawJob.logo,
    });
    if (!isSaved) {
      showToast('Job saved to your bookmarks', 'View Saved', () =>
        navigation.navigate('Wishlist')
      );
    }
  };

  const handleSubmitApplication = async () => {
    setHasSubmittedApplication(true);
    setIsApplyModalVisible(false);

    // Save job application record into orders store as a dedicated job application
    await useOrderStore.getState().loadAllOrders();

    showToast(
      `Application submitted to ${rawJob.company}!`,
      'Track My Jobs',
      () =>
        navigation.navigate('CustomerTabs', {
          screen: 'Orders',
          params: { category: 'Jobs' },
        })
    );
  };

  const skills = Array.isArray(rawJob.skills) ? rawJob.skills : ['React Native', 'TypeScript', 'Node.js'];
  const logo = rawJob.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80';
  const companyInfo = rawJob.companyInfo || {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isLight ? '#FFF1C7' : colors.background,
            borderBottomColor: isLight ? 'rgba(242, 183, 5, 0.25)' : colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icons.ArrowLeft color={colors.text} size={20} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {isInternship ? 'Internship Details' : 'Job Details'}
        </Text>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleSaveToggle}>
            <Icons.Bookmark
              color={isSaved ? '#F5B800' : colors.text}
              fill={isSaved ? '#F5B800' : 'transparent'}
              size={19}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================================= */}
        {/* 1. JOB OVERVIEW CARD                                                      */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
              borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
            },
          ]}
        >
          <View style={styles.companyRow}>
            <Image source={{ uri: logo }} style={styles.companyLogo} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.jobTitleText, { color: colors.text }]} numberOfLines={2}>
                  {rawJob.title || 'Senior Software Developer'}
                </Text>
              </View>
              <View style={styles.companyMeta}>
                <Text style={[styles.companyName, { color: colors.primary }]}>
                  {rawJob.company || 'TechForge Solutions'}
                </Text>
                {rawJob.isVerified !== false && (
                  <Icons.CheckCircle2 color="#0EA5E9" size={13} style={{ marginLeft: 4 }} />
                )}
              </View>
            </View>
          </View>

          {/* Highlights Grid */}
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Icons.Briefcase color="#0EA5E9" size={14} />
              <View>
                <Text style={styles.overviewLabel}>
                  {isInternship ? 'DURATION' : 'EXPERIENCE'}
                </Text>
                <Text style={[styles.overviewValue, { color: colors.text }]}>
                  {isInternship ? rawJob.duration || '3 Months' : rawJob.experience || '0–2 yrs'}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icons.IndianRupee color="#059669" size={14} />
              <View>
                <Text style={styles.overviewLabel}>
                  {isInternship ? 'STIPEND' : 'SALARY'}
                </Text>
                <Text style={[styles.overviewValue, { color: '#059669', fontWeight: '800' }]}>
                  {rawJob.salary || '₹10–₹16 LPA'}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icons.MapPin color="#EC4899" size={14} />
              <View>
                <Text style={styles.overviewLabel}>LOCATION</Text>
                <Text style={[styles.overviewValue, { color: colors.text }]}>
                  {rawJob.location || 'Bangalore'}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icons.Building2 color="#8B5CF6" size={14} />
              <View>
                <Text style={styles.overviewLabel}>WORK MODE</Text>
                <Text style={[styles.overviewValue, { color: colors.text }]}>
                  {rawJob.workMode || 'On-site'}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icons.Layers color="#F59E0B" size={14} />
              <View>
                <Text style={styles.overviewLabel}>TYPE</Text>
                <Text style={[styles.overviewValue, { color: colors.text }]}>
                  {rawJob.employmentType || 'Full-time'}
                </Text>
              </View>
            </View>

            <View style={styles.overviewItem}>
              <Icons.Users color="#10B981" size={14} />
              <View>
                <Text style={styles.overviewLabel}>OPENINGS</Text>
                <Text style={[styles.overviewValue, { color: colors.text }]}>
                  {rawJob.openings || 3} Positions
                </Text>
              </View>
            </View>
          </View>

          {/* Key Skills Chips */}
          <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 12 }]}>
            REQUIRED SKILLS
          </Text>
          <View style={styles.skillsContainer}>
            {skills.map((skill, idx) => (
              <View key={idx} style={styles.skillBadge}>
                <Text style={styles.skillBadgeText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 2. JOB DESCRIPTION & RESPONSIBILITIES                                    */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
              borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Job Description</Text>

          <Text style={[styles.descriptionText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.75)' }]}>
            {rawJob.description}
          </Text>

          <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 14 }]}>
            KEY RESPONSIBILITIES
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.bulletText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.75)' }]}>
                Architect and build performant React Native applications for Android & iOS.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.bulletText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.75)' }]}>
                Integrate complex GraphQL/REST APIs with offline-first state synchronization.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={[styles.bulletText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.75)' }]}>
                Optimize app bundle size, startup time, and native UI render performance.
              </Text>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 3. ABOUT COMPANY SECTION                                                  */}
        {/* ========================================================================= */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isLight ? '#FFFFFF' : 'rgba(13, 22, 54, 0.65)',
              borderColor: isLight ? '#F1EAD8' : colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionHeading, { color: colors.text }]}>About Company</Text>

          <View style={styles.companyProfileRow}>
            <Image source={{ uri: logo }} style={styles.companyProfileLogo} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.companyProfileName, { color: colors.text }]}>
                {rawJob.company || 'TechForge Solutions'}
              </Text>
              <Text style={styles.companyProfileMeta}>
                {companyInfo.industry || 'IT & Product Engineering'} • {companyInfo.size || '250+ Employees'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.websiteBtn}
              onPress={() => Linking.openURL(companyInfo.website || 'https://techforge.in')}
            >
              <Icons.Globe color="#0EA5E9" size={14} />
              <Text style={styles.websiteBtnText}>Website</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.descriptionText, { color: isLight ? '#475569' : 'rgba(255,255,255,0.75)', marginTop: 8 }]}>
            {companyInfo.about || 'TechForge Solutions is a premier digital engineering studio delivering innovative cloud and mobile software.'}
          </Text>

          <View style={styles.companyInfoFooter}>
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>FOUNDED</Text>
              <Text style={[styles.infoColVal, { color: colors.text }]}>
                {companyInfo.founded || '2018'}
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>HEADQUARTERS</Text>
              <Text style={[styles.infoColVal, { color: colors.text }]}>
                {companyInfo.hq || 'Bangalore'}
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoColLabel}>RATING</Text>
              <Text style={[styles.infoColVal, { color: colors.text }]}>
                ★ {companyInfo.rating || '4.7'} ({companyInfo.reviewsCount || '180'})
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: isLight ? '#FFFFFF' : colors.background,
            borderTopColor: isLight ? '#F1EAD8' : colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.saveActionBtn}
          onPress={handleSaveToggle}
          activeOpacity={0.8}
        >
          <Icons.Bookmark
            color={isSaved ? '#F5B800' : colors.text}
            fill={isSaved ? '#F5B800' : 'transparent'}
            size={18}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryApplyBtn, hasSubmittedApplication && styles.submittedBtn]}
          activeOpacity={0.85}
          onPress={() => {
            if (hasSubmittedApplication) {
              showToast('Application already submitted', 'Track Application', () =>
                navigation.navigate('CustomerTabs', {
                  screen: 'Orders',
                  params: { category: 'Jobs' },
                })
              );
            } else {
              setIsApplyModalVisible(true);
            }
          }}
        >
          <Text style={[styles.primaryApplyBtnText, hasSubmittedApplication && styles.submittedBtnText]}>
            {hasSubmittedApplication
              ? '✓ Application Submitted'
              : isInternship
              ? 'Apply for Internship'
              : 'Apply Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* JOB APPLICATION BOTTOM SHEET                                             */}
      {/* ========================================================================= */}
      <Modal
        visible={isApplyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsApplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isLight ? '#FFFDF5' : '#0B1530',
                borderColor: isLight ? '#FDE68A' : colors.cardBorder,
                maxHeight: height * 0.85,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
                  {isInternship ? 'Internship Application' : 'Job Application'}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  Applying to {rawJob.company}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsApplyModalVisible(false)}>
                <Icons.X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 18 }} showsVerticalScrollIndicator={false}>
              {/* Selected Resume */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>SELECT RESUME</Text>
              <View style={styles.resumeCard}>
                <Icons.FileText color="#F5B800" size={20} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.resumeName}>{applicantResume}</Text>
                  <Text style={styles.resumeMeta}>Updated 3 days ago • PDF</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>

              {/* Education */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                HIGHEST EDUCATION
              </Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: isLight ? '#E2E8F0' : colors.cardBorder }]}
                value={applicantEducation}
                onChangeText={setApplicantEducation}
              />

              {/* Notice Period */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                NOTICE PERIOD / AVAILABILITY
              </Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: isLight ? '#E2E8F0' : colors.cardBorder }]}
                value={applicantNoticePeriod}
                onChangeText={setApplicantNoticePeriod}
              />

              {/* Expected Salary */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                EXPECTED {isInternship ? 'STIPEND' : 'SALARY'}
              </Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: isLight ? '#E2E8F0' : colors.cardBorder }]}
                value={expectedSalary}
                onChangeText={setExpectedSalary}
              />

              {/* Screening Question */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                SCREENING QUESTION: Relevant Experience
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.text, borderColor: isLight ? '#E2E8F0' : colors.cardBorder, height: 70, textAlignVertical: 'top' },
                ]}
                value={screeningAnswer}
                onChangeText={setScreeningAnswer}
                multiline
              />

              {/* Submit Action */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                activeOpacity={0.85}
                onPress={handleSubmitApplication}
              >
                <Text style={styles.modalSubmitBtnText}>
                  {isInternship ? 'Submit Internship Application' : 'Submit Application'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  jobTitleText: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  overviewItem: {
    width: (width - 70) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  overviewValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  skillBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F5B800',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  companyProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyProfileLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  companyProfileName: {
    fontSize: 14,
    fontWeight: '800',
  },
  companyProfileMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  websiteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  companyInfoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoCol: {
    alignItems: 'center',
  },
  infoColLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  infoColVal: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  saveActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryApplyBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#F5B800',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryApplyBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  submittedBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  submittedBtnText: {
    color: '#059669',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 30, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    borderRadius: 12,
  },
  resumeName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  resumeMeta: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  modalSubmitBtn: {
    backgroundColor: '#F5B800',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
});
